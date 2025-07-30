import '../styles/globals.css';

export const metadata = {
  title: 'Agrichain',
  description: 'Empowering Indian farmers through blockchain technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/favicon.ico" /> {/* Add a favicon if you have one */}
      </head>
      <body>
        <main>{children}</main> {/* Use main for better semantic structure */}
      </body>
    </html>
  );
}
