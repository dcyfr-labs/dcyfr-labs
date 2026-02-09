import { PageLayout } from '@/components/layouts';
import { createPageMetadata } from '@/lib/metadata';
import { CONTAINER_WIDTHS, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

export const metadata = createPageMetadata({
  title: 'Font Showcase — Geist Family',
  description:
    'Showcase of the complete Geist font family including Sans, Mono, and Pixel variants',
  path: '/dev/fonts',
});

export default function FontShowcasePage() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard} space-y-${SPACING.section}`}>
        {/* Header */}
        <div className={`space-y-${SPACING.compact}`}>
          <h1 className={TYPOGRAPHY.h1.standard}>Geist Font Family</h1>
          <p className={TYPOGRAPHY.description}>
            Complete showcase of the Vercel Geist font family: Sans, Mono, and the new Geist Pixel
            variants.
          </p>
        </div>

        {/* Geist Sans */}
        <section className={`space-y-${SPACING.content}`}>
          <h2 className={TYPOGRAPHY.h2.standard}>Geist Sans</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Heading 1 - Hero</p>
              <h1 className={TYPOGRAPHY.h1.hero}>The quick brown fox jumps over the lazy dog</h1>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Heading 2 - Featured</p>
              <h2 className={TYPOGRAPHY.h2.featured}>
                The quick brown fox jumps over the lazy dog
              </h2>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Body Text</p>
              <p className={TYPOGRAPHY.body}>
                The quick brown fox jumps over the lazy dog. This is standard body text using Geist
                Sans with optimal readability settings.
              </p>
            </div>
          </div>
        </section>

        {/* Geist Mono */}
        <section className={`space-y-${SPACING.content}`}>
          <h2 className={TYPOGRAPHY.h2.standard}>Geist Mono</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Code Block</p>
              <pre className="font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`const welcome = "Hello, World!";
console.log(welcome);

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`}</code>
              </pre>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Inline Code</p>
              <p className={TYPOGRAPHY.body}>
                Use{' '}
                <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  npm install geist
                </code>{' '}
                to install the Geist font package.
              </p>
            </div>
          </div>
        </section>

        {/* Geist Pixel - Square */}
        <section className={`space-y-${SPACING.content}`}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Geist Pixel — Square
            <span className="text-sm text-muted-foreground ml-2">(Bitmap-inspired)</span>
          </h2>
          <div className={SPACING.subsection}>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Extra Large (48px)</p>
              <div className={TYPOGRAPHY.pixel.square.xl}>PIXEL PERFECT</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Large (36px)</p>
              <div className={TYPOGRAPHY.pixel.square.large}>Retro Computing</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Medium (24px)</p>
              <div className={TYPOGRAPHY.pixel.square.medium}>Dashboard Accent</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Small (16px)</p>
              <div className={TYPOGRAPHY.pixel.square.small}>Badge Text Style</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">All Characters</p>
              <div className={`${TYPOGRAPHY.pixel.square.small} break-all`}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                <br />
                abcdefghijklmnopqrstuvwxyz
                <br />
                0123456789
                <br />
                !@#$%^&amp;*()_+-=[]&#123;&#125;;&#39;:&quot;,.&lt;&gt;?/
              </div>
            </div>
          </div>
        </section>

        {/* Geist Pixel - Grid */}
        <section className={`space-y-${SPACING.content}`}>
          <h2 className={TYPOGRAPHY.h2.standard}>
            Geist Pixel — Grid
            <span className="text-sm text-muted-foreground ml-2">(Grid structure visible)</span>
          </h2>
          <div className={SPACING.subsection}>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Extra Large (48px)</p>
              <div className={TYPOGRAPHY.pixel.grid.xl}>GRID SYSTEM</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Large (36px)</p>
              <div className={TYPOGRAPHY.pixel.grid.large}>Blueprint Style</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Medium (24px)</p>
              <div className={TYPOGRAPHY.pixel.grid.medium}>Interface Typography</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Small (16px)</p>
              <div className={TYPOGRAPHY.pixel.grid.small}>Technical Labels</div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className={`space-y-${SPACING.content}`}>
          <h2 className={TYPOGRAPHY.h2.standard}>Use Cases & Best Practices</h2>
          <div className={`space-y-${SPACING.content}`}>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className={`${TYPOGRAPHY.h3.standard} mb-${SPACING.compact}`}>
                When to Use Geist Pixel
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>✅ Banners and hero sections with retro aesthetic</li>
                <li>✅ Dashboard accents for technical environments</li>
                <li>✅ Easter eggs and interactive moments</li>
                <li>✅ Product feature highlights</li>
                <li>✅ Experimental layouts</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className={`${TYPOGRAPHY.h3.standard} mb-${SPACING.compact}`}>
                When NOT to Use Geist Pixel
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>❌ Long-form reading content (use Geist Sans/Serif)</li>
                <li>❌ Accessibility-critical UI elements</li>
                <li>❌ Small text under 14px</li>
                <li>❌ Formal documentation</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className={`${TYPOGRAPHY.h3.standard} mb-${SPACING.compact}`}>
                Technical Details
              </h3>
              <ul className="space-y-2 text-foreground/90 font-mono text-sm">
                <li>
                  📦 Package: <code className="bg-background px-2 py-1 rounded">geist</code>
                </li>
                <li>🎨 Variants: Square, Grid, Circle, Triangle, Line (5 total)</li>
                <li>🔤 Glyphs: 480 per variant</li>
                <li>🌍 Languages: 32 supported</li>
                <li>📐 Metrics: Aligned with Geist Sans/Mono</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className={`mt-${SPACING.section} pt-${SPACING.section} border-t border-border`}>
          <p className="text-sm text-muted-foreground text-center">
            Learn more about the Geist font family at{' '}
            <a
              href="https://vercel.com/font"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              vercel.com/font
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
