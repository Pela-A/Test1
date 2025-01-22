import {themes as prismThemes} from 'prism-react-renderer';
import fs from 'fs/promises';
import path from 'path';
import { fetchRemoteContentConfig } from './fetchremotecontent.js';
import sidebars from './sidebars.js';
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

// JSDOc comment
// With a JSDoc tag that tells the TypeScript type checker what the type of the following value
// This is saying that the object below (config) has the type of Config which comes from the Docusaurus package
/** @type {import('@docusaurus/types').Config} */

export default async function config() {
  
  
   // Build the absolute path to the JSON file containing repo information
   const jsonFilePath = path.resolve(__dirname, 'remoteContent.json');

   // Read and parse the JSON file
   const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
   const remoteConfigs = JSON.parse(fileContent);

   // Create an array of remote content configurations
   // Must wait for all remote content configurations to resolve
   const remoteContentConfigs = await Promise.all(
    remoteConfigs.map(({ author, repo, branch }) =>
      // fetchRemoteContentConfig ends up returning a "list" of arrays, which ends up being mapped to another array
      /* 
      **[
      **  [ 'docusaurus-plugin-remote-content', [Object] ],
      **  [ 'docusaurus-plugin-remote-content', [Object] ]
      **],
      */
      fetchRemoteContentConfig(author, repo, branch)
    )
  );
  // remoteContentConfigs ends up becoming an array of arrays, containing arrays with objects (an array of returns from the fetchRemoteContentConfig function)
  /*
  **[
  **  [
  **    [ 'docusaurus-plugin-remote-content', [Object] ],
  **    [ 'docusaurus-plugin-remote-content', [Object] ]
  **  ],
  **  [
  **    [ 'docusaurus-plugin-remote-content', [Object] ],
  **    [ 'docusaurus-plugin-remote-content', [Object] ]
  **  ]
  **]
  */

  // .flat() "flattens" the first level of nested arrays inside the array it is called on
  // So essentially it merges all the returns from the fetchRemoteContentConfig function
  const flattenedConfigs = await remoteContentConfigs.flat();

  // Testing for flattendConfigs
  // console.log('Flattened Remote Content Configs:', flattenedConfigs);

  // Object return that is expected by docusaurus


  return {
    title: 'My Site',
    tagline: 'Dinosaurs are cool',
    favicon: 'img/favicon.ico',

    url: 'https://your-docusaurus-site.example.com',
    baseUrl: '/',

    organizationName: 'facebook',
    projectName: 'docusaurus',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },

    presets: [
      [
        'classic',
        {
          docs: {
            sidebarPath: './sidebars.js',
            editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          },
          blog: {
            showReadingTime: true,
            feedOptions: {
              type: ['rss', 'atom'],
              xslt: true,
            },
            editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
            onInlineTags: 'warn',
            onInlineAuthors: 'warn',
            onUntruncatedBlogPosts: 'warn',
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        },
      ],

      [
        'redocusaurus',
        {
          // Plugin Options for loading OpenAPI files
          specs: [
            // Pass it a path to a local OpenAPI YAML file
            {
              // Redocusaurus will automatically bundle your spec into a single file during the build
              id: "local-api-doc",
              spec: 'openapi/openapi.yaml',
              route: '/api',
            },
            // You can also pass it a OpenAPI spec URL
            {
              id: "using-remote-url",
              spec: 'https://redocly.github.io/redoc/openapi.yaml',
              route: '/api-docs',
              
            },
          ],
          // Theme Options for modifying how redoc renders them
          theme: {
            // Change with your site colors
            sidebars: 'none',
            primaryColor: '#1890ff',
          },
        },
      ]

      
    ],
    // Where the remoteContentConfigs are placed
    plugins: 
    // format = raw for text based files and format = octetStream for images?
    // https://dev.azure.com/myorg/myProject/_apis/git/repositories/myRepo/items?=&versionDescriptor.version=main&%24format=raw&api-version=6.0path%3D/docs
    flattenedConfigs,
  
    themeConfig: {
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'My Site',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'X',
                href: 'https://x.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    },
  };
}

