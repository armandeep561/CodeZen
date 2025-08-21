export const languages = [
  { value: 'html', label: 'HTML/CSS/JS', isWeb: true, extension: 'html' },
  { value: 'javascript', label: 'JavaScript', isWeb: true, extension: 'js' },
  { value: 'python', label: 'Python', isWeb: false, extension: 'py' },
  { value: 'php', label: 'PHP', isWeb: false, extension: 'php' },
  { value: 'c', label: 'C', isWeb: false, extension: 'c' },
  { value: 'cpp', label: 'C++', isWeb: false, extension: 'cpp' },
  { value: 'java', label: 'Java', isWeb: false, extension: 'java' },
] as const;

export type LanguageValue = typeof languages[number]['value'];
export type Language = typeof languages[number];

export const templates: Record<LanguageValue, { label: string; code: string }> = {
  html: {
    label: 'Basic HTML Page',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: #f0f4f7;
      color: #333;
      padding: 2rem;
    }
    h1 {
      color: #4A6572;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is a basic HTML page.</p>
  <script>
    console.log('Hello from JavaScript!');
    document.body.insertAdjacentHTML('beforeend', '<p><em>Content added via JavaScript.</em></p>');
  </script>
</body>
</html>`
  },
  javascript: {
    label: 'DOM Manipulation',
    code: `// Create a new element
const newElement = document.createElement('div');
newElement.textContent = 'Hello from dynamically added JavaScript!';
newElement.style.color = '#69A297';
newElement.style.marginTop = '10px';
newElement.style.border = '1px solid #ccc';
newElement.style.padding = '10px';
newElement.style.borderRadius = '5px';

// Add it to the body
document.body.appendChild(newElement);`
  },
  python: {
    label: 'Hello World Function',
    code: `def hello_world():
    message = "Hello, World from Python!"
    print(message)

hello_world()`
  },
  php: {
    label: 'Hello World Echo',
    code: `<?php
  echo "<h1>Hello, World from PHP!</h1>";
?>`
  },
  c: {
    label: 'Hello World Program',
    code: `#include <stdio.h>

int main() {
   printf("Hello, World from C!");
   return 0;
}`
  },
  cpp: {
    label: 'Hello World Program',
    code: `#include <iostream>

int main() {
    std::cout << "Hello, World from C++!" << std::endl;
    return 0;
}`
  },
  java: {
    label: 'Hello World Class',
    code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World from Java!");
    }
}`
  },
};
