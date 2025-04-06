import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HARlytics - HAR file viewer & analyzer",
  description: "A powerful HAR file analyzer that transforms complex HTTP Archive files into actionable insights.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/' }
    ],

    
    sidebar: [
      {
        items: [
          { text: 'Introduction', link: '/docs/' },
        ]
      },
      {
        text: 'Filtering',
        items: [
          { text: 'Filtering Capabilities', link: '/docs/filtering-capabilities' },
        ]
      },
      {
        text: 'Tabs',
        items: [
          { text: 'Overview Tab', link: '/docs/overview-tab' },
          { text: 'Cache/CDN Tab', link: '/docs/cachecdn-tab' },
          { text: 'Sequence Tab', link: '/docs/sequence-tab' },
          
        ]
      },
      {
        items: [
          { text: 'Libraries and Credits', link: '/docs/libraries-and-credits' },
          
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/sgrastar/HARlytics' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Yuta Hoshina'
    }
  }
})
