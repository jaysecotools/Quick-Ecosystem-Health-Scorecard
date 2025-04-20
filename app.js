// Load questions from JSON
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    const questions = data.questions;
    const container = document.getElementById('question-container');
    
    // Display questions
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

    // Calculate score
    document.getElementById('submit').addEventListener('click', () => {
      let score = 0;
      questions.forEach((q, i) => {
        score += parseInt(document.getElementById(`q${i}`).value);
      });
      
      const percent = Math.round((score / (questions.length * 3)) * 100);
      document.getElementById('score').textContent = percent;
      
      // Simple feedback
      const feedback = document.getElementById('feedback');
      feedback.innerHTML = percent > 70 ? 
        "✅ Healthy ecosystem! Maintain current practices." :
        "⚠️ Needs improvement. Consider these actions:<br>- " + 
        data.recommendations.join("<br>- ");
      
      document.getElementById('result').classList.remove('hidden');
    });
  });
