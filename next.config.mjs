/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera .next/standalone: un server.js con solo las dependencias que usa la
  // app, para que la imagen de Docker sea chica (ver Dockerfile).
  output: "standalone",
};

export default nextConfig;
