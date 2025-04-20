// Debug helper - checks if files exist
async function checkFiles() {
  const requiredFiles = ['questions.json', 'style.css'];
  for (const file of requiredFiles) {
    try {
      const response = await fetch(file);
      if (!response.ok) console.error(`🚨 Missing file: ${file}`);
    } catch (e) {
      console.error(`🚨 Cannot load ${file} (check name/extension)`); 
    }
  }
}
checkFiles();

// Load previous score if exists
function loadPreviousScore() {
  const lastResult = localStorage.getItem('lastEcoScore');
  if (lastResult) {
    const { score, date, biodiversitySurvey } = JSON.parse(lastResult);
    document.getElementById('last-score').textContent = 
      `Last assessment: ${score}/100 on ${date}`;
    if (biodiversitySurvey) console.log('Previous survey data:', biodiversitySurvey);
  }
}

// Load questions from JSON
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    loadPreviousScore();
    const questions = data.questions;
    const container = document.getElementById('question-container');
    
    // Display main questions
    questions.forEach((q, i) => {
      container.innerHTML += `
        <div class="question">
          <p>${i+1}. ${q.text}</p>
          <select id="q${i}">
            <option value="3">Excellent (3)</option>
            <option value="2" selected>Moderate (2)</option>
            <option value="1">Poor (1)</option>
          </select>
        </div>
      `;
    });

    // Progress tracker
    container.addEventListener('change', () => {
      const answered = document.querySelectorAll('select:not([value="2"])').length;
      document.getElementById('progress').style.width = 
        `${(answered / questions.length) * 100}%`;
    });

    // Calculate score
    document.getElementById('submit').addEventListener('click', () => {
      let score = 0;
      questions.forEach((_, i) => {
        score += parseInt(document.getElementById(`q${i}`).value);
      });
      
      const percent = Math.round((score / (questions.length * 3)) * 100);
      const scoreElement = document.getElementById('score');
      scoreElement.textContent = percent;
      scoreElement.className = 
        percent < 40 ? 'low' : 
        percent < 70 ? 'medium' : 'high';
      
      // Feedback
      const feedback = document.getElementById('feedback');
      feedback.innerHTML = percent > 70 ? 
        "✅ Healthy ecosystem! Maintain current practices." :
        "⚠️ Needs improvement. Consider:<br>- " + 
        (data.recommendations?.join("<br>- ") || "No recommendations available");
      
      // Show results
      document.getElementById('result').classList.remove('hidden');
      document.getElementById('print').classList.remove('hidden');

      // Biodiversity survey (conditionally shown)
      if (percent < 70 && data.biodiversitySurvey) {
        const surveyContainer = document.getElementById('survey-container');
        const surveyQuestions = document.getElementById('survey-questions');
        surveyQuestions.innerHTML = '';
        
        data.biodiversitySurvey.forEach((q, i) => {
          surveyQuestions.innerHTML += `
            <div class="survey-question">
              <label>${q.text}</label>
              ${q.type === 'checkbox' ? 
                `<input type="checkbox" id="survey-q${i}">` : 
                `<input type="${q.type}" id="survey-q${i}">`
              }
            </div>
          `;
        });
        
        surveyContainer.style.display = 'block';
        
        document.getElementById('save-survey').onclick = () => {
          const surveyData = data.biodiversitySurvey.map((q, i) => ({
            question: q.text,
            answer: document.getElementById(`survey-q${i}`)[q.type === 'checkbox' ? 'checked' : 'value']
          }));
          
          // Update saved result
          const saved = JSON.parse(localStorage.getItem('lastEcoScore') || '{}');
          localStorage.setItem('lastEcoScore', JSON.stringify({
            ...saved,
            score: percent,
            date: new Date().toLocaleDateString(),
            biodiversitySurvey: surveyData
          }));
          
          alert("Biodiversity data saved!");
        };
      }
      
      // Save basic results (without survey if not applicable)
      if (!(percent < 70 && data.biodiversitySurvey)) {
        localStorage.setItem('lastEcoScore', JSON.stringify({
          score: percent,
          date: new Date().toLocaleDateString()
        }));
      }
    });

    // Print handler
    document.getElementById('print').onclick = () => window.print();
  })
  .catch(error => {
    console.error("Error loading questions:", error);
    document.getElementById('question-container').innerHTML = 
      `<p class='error'>⚠️ Error loading questions. Check console.</p>`;
  });
