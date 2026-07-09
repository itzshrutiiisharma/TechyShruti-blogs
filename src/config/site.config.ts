// Edit THIS file whenever you want to change your site's identity,
// theme, or feature flags. Nothing else in the codebase should
// hardcode these values — always import siteConfig instead.

export const siteConfig = {
  name: "YourBlogName",
  tagline: "Notes on tech, one post at a time",
  domain: "yourblog.com",
  author: "Shruti",

  social: {
    github: "https://github.com/yourhandle",
    linkedin: "https://linkedin.com/in/yourhandle",
    twitter: "",
  },

  theme: {
    primaryColor: "#1D9E75",
    postsPerPage: 10,
  },

  features: {
    aiSuggestions: true,
    comments: true,
    ratings: true,
  },

  cache: {
    // how long a cached post list stays fresh, in seconds
    postListTtlSeconds: 60,
    // how long a single post stays cached, in seconds
    postTtlSeconds: 300,
  },
} as const;

export type SiteConfig = typeof siteConfig;
