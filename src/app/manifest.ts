import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bryce Nguonly PWA',
    short_name: 'bnguonly-me-PWA',
    description: 'My App as a PWA',
    start_url: '/',
    display: 'standalone',
  }
}