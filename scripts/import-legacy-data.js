const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// Replace with your actual Supabase credentials
const supabase = createClient(
  'https://qcfgxqtlkqttqbrwygol.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0'
);

const importLegacyData = async () => {
  const results = [];
  
  fs.createReadStream('google-forms-export.csv')
    .pipe(csv())
    .on('data', (row) => {
      // Determine QC Agent from email
      let qcAgent = '';
      const email = row['Email Address'];
      if (email && email.toLowerCase().includes('jennifer')) {
        qcAgent = 'Jennifer';
      } else if (email && email.toLowerCase().includes('popi')) {
        qcAgent = 'Popi';
      }

      // Extract sales rep from the "Desmaine" column
      const salesRep = row['Desmaine'] || '';

      // Skip if missing required fields
      if (!salesRep || !row['Property address']) {
        console.log('Skipping row - missing sales rep or property address');
        return;
      }

      // Map scoring fields (assuming 1-3 scale)
      const mapScore = (value) => {
        if (!value || value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      // Calculate section averages
      const introScores = [
        row['Intro: introduces self clearly and professionally'],
        row['Intro: states company name and purpose of call'],
        row['Intro: confirms time availability with prospect.']
      ].map(mapScore).filter(s => s !== null);

      const bondingScores = [
        row['Bonding and Rapport: Used open-ended questions to get the client talking'],
        row['Bonding and Rapport: Finds personal connection and builds trust'],
        row['Bonding and Rapport: Shows genuine interest and sincerity.']
      ].map(mapScore).filter(s => s !== null);

      const magicProblemScores = [
        row['Magic Problem: Listens without interrupting'],
        row['Magic Problem: Identifies core reason for selling. Goes down the Pain Funnel.'],
        row['Magic Problem: Summarizes and confirms understanding']
      ].map(mapScore).filter(s => s !== null);

      const firstAskScores = [
        row['First Ask: Asks for first desired price confidently.'],
        row['First Ask: Asks about timeframe'],
        row['First Ask: Explains our process clearly']
      ].map(mapScore).filter(s => s !== null);

      const propertyScores = [
        row['Property & Condition Questions: Collects decision maker information'],
        row['Property & Condition Questions: Gathered occupancy/tenant details'],
        row['Property & Condition Questions: Covered condition of all major systems and possible repairs']
      ].map(mapScore).filter(s => s !== null);

      const secondAskScores = [
        row['Second Ask: Reviews repair estimate with seller'],
        row['Second Ask: Frames "walk away" amount effectively'],
        row['Second Ask: Prepares seller for follow up call.']
      ].map(mapScore).filter(s => s !== null);

      const secondCallScores = [
        row['Second Call The Close: Presents CASH and RBP offers clearly.'],
        row['Second Call The Close: Uses seller motivation to position offer'],
        row['Second Call The Close: Handles objections confidently.']
      ].map(mapScore).filter(s => s !== null);

      const overallScores = [
        row['Overall Performance: Maintains positive, professional tone.'],
        row['Overall Performance: Follows script while adapting naturally'],
        row['Overall Performance: Achieves call objective- closes the deal.']
      ].map(mapScore).filter(s => s !== null);

      // Calculate overall average
      const allScores = [
        ...introScores, ...bondingScores, ...magicProblemScores, 
        ...firstAskScores, ...propertyScores, ...secondAskScores, 
        ...secondCallScores, ...overallScores
      ];
      
      const overallAverage = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;

      // Collect comments
      const comments = [];
      Object.keys(row).forEach(key => {
        if (key === 'COMMENTS' && row[key] && row[key].trim()) {
          comments.push(row[key].trim());
        }
      });

      // Create submission record matching your schema
      const submission = {
        sales_rep: salesRep,
        qc_agent: qcAgent,
        property_address: row['Property address'] || '',
        lead_type: 'Active', // Default to Active, adjust as needed
        final_comment: comments.join(' | ') || row['Notes'] || '',
        overall_average: Math.round(overallAverage * 100) / 100, // Round to 2 decimal places
        submission_date: new Date(row['Timestamp']).toISOString().split('T')[0],
        created_at: new Date(row['Timestamp']).toISOString()
      };

      // Store individual scores for later insertion
      submission._scores = {
        intro: introScores,
        bonding: bondingScores,
        magic_problem: magicProblemScores,
        first_ask: firstAskScores,
        property_questions: propertyScores,
        second_ask: secondAskScores,
        second_call: secondCallScores,
        overall_performance: overallScores
      };

      results.push(submission);
    })
    .on('end', async () => {
      console.log(`Preparing to import ${results.length} submissions...`);
      
      if (results.length === 0) {
        console.log('No valid records to import.');
        return;
      }

      try {
        let imported = 0;
        
        for (const submissionData of results) {
          // Extract scores before inserting submission
          const scores = submissionData._scores;
          delete submissionData._scores;
          
          console.log(`Importing submission for ${submissionData.sales_rep}...`);
          
          // Insert submission
          const { data: submission, error: submissionError } = await supabase
            .from('submissions')
            .insert([submissionData])
            .select()
            .single();
            
          if (submissionError) {
            console.error(`Failed to import submission for ${submissionData.sales_rep}:`, submissionError);
            continue;
          }
          
          // Insert individual scores into submission_scores table
          const scoreInserts = [];
          
          // Intro section scores
          const introQuestions = [
            'introduces self clearly and professionally',
            'states company name and purpose of call', 
            'confirms time availability with prospect'
          ];
          scores.intro.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'Intro',
                question: introQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // Bonding and Rapport section scores
          const bondingQuestions = [
            'Used open-ended questions to get the client talking',
            'Finds personal connection and builds trust',
            'Shows genuine interest and sincerity'
          ];
          scores.bonding.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'Bonding & Rapport',
                question: bondingQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // Magic Problem section scores
          const magicProblemQuestions = [
            'Listens without interrupting',
            'Identifies core reason for selling. Goes down the Pain Funnel',
            'Summarizes and confirms understanding'
          ];
          scores.magic_problem.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'Magic Problem',
                question: magicProblemQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // First Ask section scores
          const firstAskQuestions = [
            'Asks for first desired price confidently',
            'Asks about timeframe',
            'Explains our process clearly'
          ];
          scores.first_ask.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'First Ask',
                question: firstAskQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // Property & Condition Questions section scores
          const propertyQuestions = [
            'Collects decision maker information',
            'Gathered occupancy/tenant details',
            'Covered condition of all major systems and possible repairs'
          ];
          scores.property_questions.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'Property & Condition Questions',
                question: propertyQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // Second Ask section scores
          const secondAskQuestions = [
            'Reviews repair estimate with seller',
            'Frames "walk away" amount effectively',
            'Prepares seller for follow up call'
          ];
          scores.second_ask.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'Second Ask',
                question: secondAskQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // Second Call - The Close section scores
          const secondCallQuestions = [
            'Presents CASH and RBP offers clearly',
            'Uses seller motivation to position offer',
            'Handles objections confidently'
          ];
          scores.second_call.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'Second Call - The Close',
                question: secondCallQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // Overall Performance section scores
          const overallQuestions = [
            'Maintains positive, professional tone',
            'Follows script while adapting naturally',
            'Achieves call objective- closes the deal'
          ];
          scores.overall_performance.forEach((score, index) => {
            if (score !== null) {
              scoreInserts.push({
                submission_id: submission.id,
                section: 'Overall Performance',
                question: overallQuestions[index],
                rating: score.toString(),
                comment: null
              });
            }
          });

          // Insert all scores for this submission
          if (scoreInserts.length > 0) {
            const { error: scoresError } = await supabase
              .from('submission_scores')
              .insert(scoreInserts);
              
            if (scoresError) {
              console.error(`Failed to import scores for ${submissionData.sales_rep}:`, scoresError);
            } else {
              console.log(`  ✓ Inserted ${scoreInserts.length} individual scores`);
            }
          }
          
          imported++;
          console.log(`✓ Imported ${submissionData.sales_rep}`);
        }
        
        console.log(`Import completed! ${imported} out of ${results.length} submissions imported.`);
        
      } catch (error) {
        console.error('Import failed:', error);
      }
    });
};

// Run the import
importLegacyData();