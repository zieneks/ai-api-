const fs = require('fs');
const path = require('path');

const API_KEY ='tutaj wpisac api key';
function readArticle(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Błąd przy odczycie pliku:', error);
    return null;
  }
}

async function generateArticleHTML(articleContent) {
  try {
    const fetch = (await import('node-fetch')).default;

    const messages = [
      { role: 'system', content: 'You are an assistant that converts articles into structured HTML.' },
      { role: 'user', content: `Convert the following article content into structured HTML with image placeholders and captions:\n\n${articleContent}.Do not include <html> tags,
<head> or <body> ` },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', 
        messages: messages,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      console.error('Błąd w odpowiedzi OpenAI:', data);
      return null;
    }
  } catch (error) {
    console.error('Błąd przy generowaniu HTML:', error);
    return null;
  }
}

function saveHTMLToFile(htmlContent, filePath) {
  try {
    fs.writeFileSync(filePath, htmlContent);
    console.log('HTML zapisany do pliku:', filePath);
  } catch (error) {
    console.error('Błąd przy zapisie pliku:', error);
  }
}


function generatePreviewTemplate(articleHTMLPath, templatePath, outputPreviewPath) {
  try {
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    const articleContent = fs.readFileSync(articleHTMLPath, 'utf8');

    const finalPreviewContent = templateContent.replace(
      '<!-- Tutaj zostanie dodana zawartosc -->',
      articleContent
    );

    fs.writeFileSync(outputPreviewPath, finalPreviewContent);
    console.log('Podgląd artykułu zapisany w pliku:', outputPreviewPath);
  } catch (error) {
    console.error('Błąd przy generowaniu podglądu:', error);
  }
}




async function main() {
  const articlePath = './article.txt'; 
  const outputFilePath = './artykul.html';

  const articleContent = readArticle(articlePath);
  if (!articleContent) return;

  const generatedHTML = await generateArticleHTML(articleContent);
  if (generatedHTML) {
    saveHTMLToFile(generatedHTML, outputFilePath);
  }


  const articleHTMLPath = './artykul.html';
  const templatePath = './szablon.html';
  const outputPreviewPath = './podglad.html';
  generatePreviewTemplate(articleHTMLPath, templatePath, outputPreviewPath);
}

main();
