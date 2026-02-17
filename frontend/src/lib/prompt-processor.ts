import { Step, FileData, StepType } from "../types";
import { v4 as uuidv4 } from "uuid";

/*
 * Parse input XML and convert it into steps.
 * Eg: Input -
 * <boltArtifact id=\"project-import\" title=\"Project Files\">
 *  <boltAction type=\"file\" filePath=\"eslint.config.js\">
 *      import js from '@eslint/js';\nimport globals from 'globals';\n
 *  </boltAction>
 * <boltAction type="shell">
 *      node index.js
 * </boltAction>
 * </boltArtifact>
 *
 * Output -
 * [{
 *      title: "Project Files",
 *      status: "Pending"
 * }, {
 *      title: "Create eslint.config.js",
 *      type: StepType.CreateFile,
 *      code: "import js from '@eslint/js';\nimport globals from 'globals';\n"
 * }, {
 *      title: "Run command",
 *      code: "node index.js",
 *      type: StepType.RunScript
 * }]
 *
 * The input can have strings in the middle they need to be ignored
 */
export function generateStepsFromPrompt(response: string): Step[] {
  // Extract the XML content between <boltArtifact> tags
  const xmlMatch = response.match(
    /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/
  );

  if (!xmlMatch) {
    return [];
  }

  const xmlContent = xmlMatch[1];
  const steps: Step[] = [];
  let stepId = 1;

  // Extract artifact title
  // const titleMatch = response.match(/title="([^"]*)"/);
  // const artifactTitle = titleMatch ? titleMatch[1] : "Project Files";

  // // Add initial artifact step
  // steps.push({
  //   id: stepId++,
  //   title: artifactTitle,
  //   description: "",
  //   type: StepType.CreateFolder,
  //   status: "completed",
  // });

  // Regular expression to find boltAction elements
  const actionRegex =
    /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;

  console.log(actionRegex, xmlContent, xmlMatch, "__ACTION REGEX");

  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;

    if (type === "file") {
      // File creation step
      steps.push({
        id: stepId++,
        title: `Create ${filePath || "file"}`,
        description: "",
        type: StepType.CreateFile,
        status: "pending",
        code: content.trim(),
        path: filePath,
      });
    } else if (type === "shell") {
      // Shell command step
      steps.push({
        id: stepId++,
        title: "Run command",
        description: "",
        type: StepType.RunScript,
        status: "pending",
        code: content.trim(),
      });
    }
  }

  return steps;
}

// export const generateStepsFromPrompt = (prompt: string): Step[] => {
//   const commonSteps: Step[] = [
//     {
//       id: uuidv4(),
//       title: 'Set up project structure',
//       description: 'Create the basic folder structure for your website',
//       completed: false
//     },
//     {
//       id: uuidv4(),
//       title: 'Create HTML structure',
//       description: 'Build the foundational HTML for your landing page',
//       completed: false
//     },
//     {
//       id: uuidv4(),
//       title: 'Style with CSS',
//       description: 'Add styling to make your website visually appealing',
//       completed: false
//     },
//     {
//       id: uuidv4(),
//       title: 'Add JavaScript functionality',
//       description: 'Implement interactive features with JavaScript',
//       completed: false
//     }
//   ];

//   const additionalSteps: Step[] = [];

//   if (prompt.toLowerCase().includes('portfolio')) {
//     additionalSteps.push({
//       id: uuidv4(),
//       title: 'Create portfolio showcase',
//       description: 'Design a gallery or grid to showcase your work',
//       completed: false
//     });
//   }

//   if (prompt.toLowerCase().includes('blog')) {
//     additionalSteps.push({
//       id: uuidv4(),
//       title: 'Set up blog posts',
//       description: 'Create templates for blog posts and categories',
//       completed: false
//     });
//   }

//   if (prompt.toLowerCase().includes('ecommerce') || prompt.toLowerCase().includes('shop')) {
//     additionalSteps.push({
//       id: uuidv4(),
//       title: 'Build product listings',
//       description: 'Create product cards and category pages',
//       completed: false
//     });
//     additionalSteps.push({
//       id: uuidv4(),
//       title: 'Implement shopping cart',
//       description: 'Add functionality for users to add items to cart',
//       completed: false
//     });
//   }

//   if (prompt.toLowerCase().includes('contact')) {
//     additionalSteps.push({
//       id: uuidv4(),
//       title: 'Add contact form',
//       description: 'Create a form for users to get in touch',
//       completed: false
//     });
//   }

//   return [...commonSteps, ...additionalSteps];
// };

export const generateFilesFromSteps = (
  files: FileData[],
  steps: Step[]
): { files: FileData[]; steps: Step[] } | null => {
  let originalFiles = [...files];
  let updateHappened = false;
  steps
    .filter(({ status }) => status === "pending")
    .map((step) => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        let finalAnswerRef = currentFileStructure;

        let currentFolder = "";
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            // final file
            let file = currentFileStructure.find(
              (x) => x.path === currentFolder
            );
            if (!file) {
              currentFileStructure.unshift({
                id: uuidv4(),
                name: currentFolderName,
                type: "file",
                path: currentFolder,
                content: step.code,
              });
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(
              (x) => x.path === currentFolder
            );
            if (!folder) {
              // create the folder
              currentFileStructure.unshift({
                id: uuidv4(),
                name: currentFolderName,
                type: "folder",
                path: currentFolder,
                children: [],
              });
            }

            currentFileStructure = currentFileStructure.find(
              (x) => x.path === currentFolder
            )!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    });

  if (updateHappened) {
    return {
      files: originalFiles,
      steps: steps.map((s: Step) => {
        return {
          ...s,
          status: "completed",
        };
      }),
    };
  }
  return null;
};

// export const generateInitialFiles = (prompt: string): FileData[] => {
//   const fileStructure: FileData[] = [
//     {
//       id: uuidv4(),
//       name: "index.html",
//       path: "/index.html",
//       type: "file",
//       content: `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Modern Portfolio Website</title>
//   <link rel="stylesheet" href="styles/main.css">
//   <link rel="preconnect" href="https://fonts.googleapis.com">
//   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
// </head>
// <body>
//   <header class="header">
//     <nav class="nav">
//       <div class="logo">Portfolio</div>
//       <ul class="nav-links">
//         <li><a href="#home" class="active">Home</a></li>
//         <li><a href="#work">Work</a></li>
//         <li><a href="#about">About</a></li>
//         <li><a href="#contact">Contact</a></li>
//       </ul>
//       <button class="mobile-nav-toggle" aria-label="Toggle navigation">
//         <span></span>
//         <span></span>
//         <span></span>
//       </button>
//     </nav>
//   </header>

//   <main>
//     <section id="home" class="hero">
//       <div class="container">
//         <h1 class="hero-title">Creative Developer & Designer</h1>
//         <p class="hero-subtitle">Crafting beautiful digital experiences</p>
//         <div class="hero-cta">
//           <a href="#work" class="btn btn-primary">View My Work</a>
//           <a href="#contact" class="btn btn-secondary">Get in Touch</a>
//         </div>
//       </div>
//     </section>

//     <section id="work" class="work">
//       <div class="container">
//         <h2 class="section-title">Featured Projects</h2>
//         <div class="project-grid">
//           <article class="project-card">
//             <div class="project-image">
//               <img src="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg" alt="Project 1" loading="lazy">
//             </div>
//             <div class="project-content">
//               <h3>E-commerce Platform</h3>
//               <p>A modern shopping experience built with React</p>
//               <a href="#" class="btn btn-sm">View Project</a>
//             </div>
//           </article>
//           <article class="project-card">
//             <div class="project-image">
//               <img src="https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg" alt="Project 2" loading="lazy">
//             </div>
//             <div class="project-content">
//               <h3>Travel Blog</h3>
//               <p>Custom WordPress theme development</p>
//               <a href="#" class="btn btn-sm">View Project</a>
//             </div>
//           </article>
//         </div>
//       </div>
//     </section>

//     <section id="contact" class="contact">
//       <div class="container">
//         <h2 class="section-title">Get in Touch</h2>
//         <form class="contact-form">
//           <div class="form-group">
//             <label for="name">Name</label>
//             <input type="text" id="name" required>
//           </div>
//           <div class="form-group">
//             <label for="email">Email</label>
//             <input type="email" id="email" required>
//           </div>
//           <div class="form-group">
//             <label for="message">Message</label>
//             <textarea id="message" rows="5" required></textarea>
//           </div>
//           <button type="submit" class="btn btn-primary">Send Message</button>
//         </form>
//       </div>
//     </section>
//   </main>

//   <footer class="footer">
//     <div class="container">
//       <p>&copy; 2025 Your Portfolio. All rights reserved.</p>
//       <div class="social-links">
//         <a href="#" aria-label="GitHub">GitHub</a>
//         <a href="#" aria-label="LinkedIn">LinkedIn</a>
//         <a href="#" aria-label="Twitter">Twitter</a>
//       </div>
//     </div>
//   </footer>

//   <script src="scripts/main.js"></script>
// </body>
// </html>`,
//     },
//     {
//       id: uuidv4(),
//       name: "styles",
//       path: "/styles",
//       type: "folder",
//       children: [
//         {
//           id: uuidv4(),
//           name: "main.css",
//           path: "/styles/main.css",
//           type: "file",
//           content: `/* Modern CSS Reset */
// *,
// *::before,
// *::after {
//   box-sizing: border-box;
//   margin: 0;
//   padding: 0;
// }

// /* Custom Properties */
// :root {
//   --color-primary: #4a6bff;
//   --color-primary-dark: #3451db;
//   --color-secondary: #2a2a2a;
//   --color-text: #333333;
//   --color-text-light: #666666;
//   --color-background: #ffffff;
//   --color-border: #e5e7eb;
//   --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
//   --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
//   --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
// }

// /* Base Styles */
// body {
//   font-family: 'Inter', sans-serif;
//   line-height: 1.6;
//   color: var(--color-text);
//   background-color: var(--color-background);
// }

// .container {
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 0 2rem;
// }

// /* Typography */
// h1, h2, h3, h4, h5, h6 {
//   line-height: 1.2;
//   color: var(--color-secondary);
//   margin-bottom: 1rem;
// }

// .section-title {
//   font-size: 2.5rem;
//   text-align: center;
//   margin-bottom: 3rem;
// }

// /* Header & Navigation */
// .header {
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   background: rgba(255, 255, 255, 0.9);
//   backdrop-filter: blur(10px);
//   z-index: 1000;
//   border-bottom: 1px solid var(--color-border);
// }

// .nav {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   height: 80px;
//   padding: 0 2rem;
// }

// .logo {
//   font-size: 1.5rem;
//   font-weight: 700;
//   color: var(--color-primary);
// }

// .nav-links {
//   display: flex;
//   gap: 2rem;
//   list-style: none;
// }

// .nav-links a {
//   text-decoration: none;
//   color: var(--color-text);
//   font-weight: 500;
//   transition: color 0.3s ease;
// }

// .nav-links a:hover,
// .nav-links a.active {
//   color: var(--color-primary);
// }

// /* Buttons */
// .btn {
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   padding: 0.75rem 1.5rem;
//   font-weight: 500;
//   border-radius: 0.375rem;
//   text-decoration: none;
//   transition: all 0.3s ease;
//   cursor: pointer;
//   border: none;
// }

// .btn-primary {
//   background-color: var(--color-primary);
//   color: white;
// }

// .btn-primary:hover {
//   background-color: var(--color-primary-dark);
//   transform: translateY(-1px);
// }

// .btn-secondary {
//   background-color: white;
//   color: var(--color-primary);
//   border: 1px solid var(--color-primary);
// }

// .btn-secondary:hover {
//   background-color: var(--color-primary);
//   color: white;
// }

// .btn-sm {
//   padding: 0.5rem 1rem;
//   font-size: 0.875rem;
// }

// /* Hero Section */
// .hero {
//   min-height: 100vh;
//   display: flex;
//   align-items: center;
//   text-align: center;
//   padding: 6rem 0;
//   background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);
// }

// .hero-title {
//   font-size: 4rem;
//   font-weight: 700;
//   margin-bottom: 1.5rem;
//   background: linear-gradient(to right, var(--color-primary), #6d28d9);
//   -webkit-background-clip: text;
//   color: transparent;
// }

// .hero-subtitle {
//   font-size: 1.5rem;
//   color: var(--color-text-light);
//   margin-bottom: 2rem;
// }

// .hero-cta {
//   display: flex;
//   gap: 1rem;
//   justify-content: center;
// }

// /* Project Grid */
// .project-grid {
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//   gap: 2rem;
//   padding: 2rem 0;
// }

// .project-card {
//   background: white;
//   border-radius: 0.5rem;
//   overflow: hidden;
//   box-shadow: var(--shadow-md);
//   transition: transform 0.3s ease;
// }

// .project-card:hover {
//   transform: translateY(-5px);
// }

// .project-image {
//   aspect-ratio: 16/9;
//   overflow: hidden;
// }

// .project-image img {
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
//   transition: transform 0.3s ease;
// }

// .project-card:hover .project-image img {
//   transform: scale(1.05);
// }

// .project-content {
//   padding: 1.5rem;
// }

// /* Contact Form */
// .contact {
//   background-color: #f9fafb;
//   padding: 6rem 0;
// }

// .contact-form {
//   max-width: 600px;
//   margin: 0 auto;
// }

// .form-group {
//   margin-bottom: 1.5rem;
// }

// .form-group label {
//   display: block;
//   margin-bottom: 0.5rem;
//   font-weight: 500;
// }

// .form-group input,
// .form-group textarea {
//   width: 100%;
//   padding: 0.75rem;
//   border: 1px solid var(--color-border);
//   border-radius: 0.375rem;
//   transition: border-color 0.3s ease;
// }

// .form-group input:focus,
// .form-group textarea:focus {
//   outline: none;
//   border-color: var(--color-primary);
//   box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.1);
// }

// /* Footer */
// .footer {
//   background-color: var(--color-secondary);
//   color: white;
//   padding: 2rem 0;
//   margin-top: 4rem;
// }

// .footer .container {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// }

// .social-links {
//   display: flex;
//   gap: 1.5rem;
// }

// .social-links a {
//   color: white;
//   text-decoration: none;
//   transition: color 0.3s ease;
// }

// .social-links a:hover {
//   color: var(--color-primary);
// }

// /* Responsive Design */
// @media (max-width: 768px) {
//   .hero-title {
//     font-size: 3rem;
//   }

//   .hero-subtitle {
//     font-size: 1.25rem;
//   }

//   .nav-links {
//     display: none;
//   }

//   .mobile-nav-toggle {
//     display: block;
//   }

//   .footer .container {
//     flex-direction: column;
//     text-align: center;
//     gap: 1rem;
//   }
// }

// /* Animations */
// @keyframes fadeIn {
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

// .hero-title,
// .hero-subtitle,
// .hero-cta {
//   animation: fadeIn 1s ease-out forwards;
// }`,
//         },
//       ],
//     },
//     {
//       id: uuidv4(),
//       name: "scripts",
//       path: "/scripts",
//       type: "folder",
//       children: [
//         {
//           id: uuidv4(),
//           name: "main.js",
//           path: "/scripts/main.js",
//           type: "file",
//           content: `// Main JavaScript file
// document.addEventListener('DOMContentLoaded', () => {
//   // Smooth scrolling for navigation links
//   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//       e.preventDefault();
//       const target = document.querySelector(this.getAttribute('href'));
//       if (target) {
//         target.scrollIntoView({
//           behavior: 'smooth',
//           block: 'start'
//         });
//       }
//     });
//   });

//   // Mobile navigation toggle
//   const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
//   const navLinks = document.querySelector('.nav-links');

//   if (mobileNavToggle && navLinks) {
//     mobileNavToggle.addEventListener('click', () => {
//       navLinks.classList.toggle('active');
//       mobileNavToggle.classList.toggle('active');
//     });
//   }

//   // Form submission handling
//   const contactForm = document.querySelector('.contact-form');
//   if (contactForm) {
//     contactForm.addEventListener('submit', async (e) => {
//       e.preventDefault();

//       const formData = new FormData(contactForm);
//       const data = Object.fromEntries(formData.entries());

//       try {
//         // In a real application, you would send this data to your server
//         console.log('Form submitted:', data);

//         // Simulate API call
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         // Clear form
//         contactForm.reset();

//         // Show success message
//         alert('Message sent successfully!');
//       } catch (error) {
//         console.error('Error submitting form:', error);
//         alert('There was an error sending your message. Please try again.');
//       }
//     });
//   }

//   // Intersection Observer for scroll animations
//   const observerOptions = {
//     threshold: 0.1,
//     rootMargin: '0px 0px -50px 0px'
//   };

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         entry.target.classList.add('animate-in');
//         observer.unobserve(entry.target);
//       }
//     });
//   }, observerOptions);

//   // Observe all project cards
//   document.querySelectorAll('.project-card').forEach(card => {
//     observer.observe(card);
//   });

//   // Active navigation highlighting
//   const sections = document.querySelectorAll('section');
//   const navItems = document.querySelectorAll('.nav-links a');

//   window.addEventListener('scroll', () => {
//     let current = '';

//     sections.forEach(section => {
//       const sectionTop = section.offsetTop;
//       const sectionHeight = section.clientHeight;

//       if (window.pageYOffset >= sectionTop - 60) {
//         current = section.getAttribute('id');
//       }
//     });

//     navItems.forEach(item => {
//       item.classList.remove('active');
//       if (item.getAttribute('href').slice(1) === current) {
//         item.classList.add('active');
//       }
//     });
//   });
// });`,
//         },
//       ],
//     },
//     {
//       id: uuidv4(),
//       name: "assets",
//       path: "/assets",
//       type: "folder",
//       children: [],
//     },
//   ];

//   return fileStructure;
// };


