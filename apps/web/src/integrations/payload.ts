import type { AstroIntegration } from 'astro';

interface PayloadOptions {
  url: string;
}

export default function payloadIntegration(options: PayloadOptions): AstroIntegration {
  return {
    name: 'payload-cms',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            define: {
              'import.meta.env.PAYLOAD_URL': JSON.stringify(options.url),
            },
          },
        });
      },
    },
  };
}
