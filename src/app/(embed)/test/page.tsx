// Force dynamic rendering - don't attempt to prerender during build
// Test page for embed route group functionality
export const dynamic = 'force-dynamic';

export default function EmbedTest() {
  return (
    <div style={{ padding: '20px', background: 'yellow', border: '5px solid red' }}>
      <h1>EMBED ROUTE GROUP TEST</h1>
      <p>If you can see header/footer, Route Groups are not working.</p>
      <p>If this is the only thing visible, Route Groups are working correctly.</p>
    </div>
  );
}