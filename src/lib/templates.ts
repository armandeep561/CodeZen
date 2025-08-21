export const languages = [
  { value: 'html', label: 'HTML', isWeb: true, extension: 'html' },
  { value: 'css', label: 'CSS', isWeb: true, extension: 'css' },
  { value: 'javascript', label: 'JavaScript', isWeb: true, extension: 'js' },
  { value: 'python', label: 'Python', isWeb: false, extension: 'py' },
  { value: 'php', label: 'PHP', isWeb: false, extension: 'php' },
  { value: 'c', label: 'C', isWeb: false, extension: 'c' },
  { value: 'cpp', label: 'C++', isWeb: false, extension: 'cpp' },
  { value: 'java', label: 'Java', isWeb: false, extension: 'java' },
] as const;

export type LanguageValue = (typeof languages)[number]['value'] | 'plaintext';
export type Language = (typeof languages)[number];

export const templates: Record<Extract<LanguageValue, 'html' | 'javascript' | 'python' | 'php' | 'c' | 'cpp' | 'java'>, { label: string; code: string }> = {
  html: {
    label: 'Basic HTML Page',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is a basic HTML page.</p>
  <script src="script.js"></script>
</body>
</html>`
  },
  javascript: {
    label: 'DOM Manipulation',
    code: `console.log("Hello from script.js!");

const newElement = document.createElement('div');
newElement.textContent = 'I was added by script.js!';
document.body.appendChild(newElement);
`
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
