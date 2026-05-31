export interface ReleaseAsset {
  name: string;
  url: string;
  size: string;
}

export interface Release {
  version: string;
  name: string;
  releaseDate: string;
  releaseNotes: string;
  windowsAsset?: ReleaseAsset;
  linuxAssetDeb?: ReleaseAsset;
  linuxAssetAppImage?: ReleaseAsset;
  isPrerelease: boolean;
  htmlUrl: string;
}

export interface FetchReleasesResult {
  releases: Release[];
  isMocked: boolean;
  error?: string;
}

// High-fidelity mock releases used when GitHub API has no releases, is rate-limited, or throws an error.
const MOCK_RELEASES: Release[] = [
  {
    version: 'v1.0.1-beta',
    name: 'v1.0.1-beta Support & Splash Update',
    releaseDate: 'May 31, 2026',
    isPrerelease: true,
    htmlUrl: 'https://github.com/Abdul-Razack/billing-optics/releases/tag/v1.0.1-beta',
    releaseNotes: `## Billing Optics ERP v1.0.1-beta Performance & Aesthetics Update

This pre-release introduces minor performance adjustments and structural alignments, paving the way for upcoming native features and improved desktop responsiveness.

### 🚀 Performance Improvements
- **Optimized Splash Window**: Decreased desktop splash window display latency by 12%.
- **Reduced Bundle Bloat**: Shrinked preload file footprints to ensure instant layout rendering.
- **Enhanced Data Caching**: Optimised Express backend router structures to quicken Category fetch intervals.

### 🎨 Visual Enhancements
- **Enhanced Glassmorphism Headers**: Added subtle border lighting to tables for better hierarchy.
- **Refined Status Badges**: Unified color weights for high/medium warning states in POS dashboards.

### 🛠️ Key Fixes
- **Printer Width Margins**: Rectified thermal receipt padding overflows on older ESC/POS hardware models.
- **Form Submission Lock**: Resolved a rare locking error when modifying product details while scanning barcodes.`,
    windowsAsset: {
      name: 'Billing.Optics.ERP.Setup.1.0.1-beta.exe',
      url: 'https://github.com/Abdul-Razack/billing-optics/releases/download/v1.0.1-beta/Billing.Optics.ERP.Setup.1.0.1-beta.exe',
      size: '84.5 MB',
    },
    // No Linux asset in beta to demonstrate dynamic conditional rendering
  },
  {
    version: 'v1.0.0',
    name: 'v1.0.0 Stable Production Launch',
    releaseDate: 'May 28, 2026',
    isPrerelease: false,
    htmlUrl: 'https://github.com/Abdul-Razack/billing-optics/releases/tag/v1.0.0',
    releaseNotes: `## Billing Optics ERP v1.0.0 Stable Production Launch

We are thrilled to present the initial production stable launch of the **Billing Optics ERP** platform! Built as a high-speed, modular monolith application, Billing Optics ERP empowers modern optics retail stores with high-efficiency customer management, prescription logs, precise frame/lens inventory tracking, and swift POS invoicing.

### ⚡ Accelerated Billing & Invoicing
- **Rapid POS Checkout**: Fully optimized cart matching physical optical retail customer checkout patterns.
- **Prescription Linking**: Directly attach glass or lens prescriptions to invoices with auto-filled discounts.
- **Flexible Payments**: Simultaneous multi-mode payment processing (Cash, Cards, Digital Wallet credits).
- **Auto GST Invoicing**: Instant compliance-ready tax and invoice PDF generations.

### 📦 Precision Inventory & Prescriptions Cataloging
- **Lens Prescription Suite**: Dedicated fields for Spherical, Cylindrical, Axis, Addition, and Pupillary Distance (PD) for left/right eyes.
- **Frame Serial Tracking**: Seamless barcode integrations for scanning and tracing frames.
- **Dynamic Category Mapping**: Real-time attribute grids tailored specifically for eyewear catalogs.
- **Stock Warnings**: Automatic notifications for low stock counts on high-turnover lenses.

### 🔒 Enterprise System Integrity
- **Drizzle DB Sync**: Production-grade database migration paths utilizing PostgreSQL and Drizzle ORM.
- **Unified Auth Protocol**: Robust, token-based role permission checking (Admin, Billing Staff, Optometrist).
- **Desktop Companion App**: Electron-based client wrapper providing instant launch and desktop shortcuts.`,
    windowsAsset: {
      name: 'Billing.Optics.ERP.Setup.1.0.0.exe',
      url: 'https://github.com/Abdul-Razack/billing-optics/releases/download/v1.0.0/Billing.Optics.ERP.Setup.1.0.0.exe',
      size: '84.2 MB',
    },
    linuxAssetDeb: {
      name: 'billing-optics-erp_1.0.0_amd64.deb',
      url: 'https://github.com/Abdul-Razack/billing-optics/releases/download/v1.0.0/billing-optics-erp_1.0.0_amd64.deb',
      size: '68.4 MB',
    },
    linuxAssetAppImage: {
      name: 'Billing_Optics_ERP-1.0.0.AppImage',
      url: 'https://github.com/Abdul-Razack/billing-optics/releases/download/v1.0.0/Billing_Optics_ERP-1.0.0.AppImage',
      size: '72.1 MB',
    },
  },
];

// Helper to format bytes to human readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Helper to parse dates into beautiful strings
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export async function getReleases(): Promise<FetchReleasesResult> {
  const repoOwner = 'Abdul-Razack';
  const repoName = 'billing-optics';
  
  try {
    // Fetch with cache revalidation of 5 minutes (300 seconds)
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases`, {
      next: { revalidate: 300 },
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Billing-Optics-Download-Site',
      },
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        console.warn('GitHub API rate limit exceeded. Falling back to local high-fidelity data.');
        return { releases: MOCK_RELEASES, isMocked: true };
      }
      throw new Error(`Failed to fetch releases: ${res.statusText}`);
    }

    const data = await res.json();
    
    // If the repository has NO releases published, fall back to our mock data so the site is beautiful
    if (!Array.isArray(data) || data.length === 0) {
      console.info('No releases found on GitHub. Displaying premium fallback datasets.');
      return { releases: MOCK_RELEASES, isMocked: true };
    }

    // Process GitHub releases data
    const releases: Release[] = data.map((item: any) => {
      const release: Release = {
        version: item.tag_name,
        name: item.name || item.tag_name,
        releaseDate: formatDate(item.published_at),
        releaseNotes: item.body || '',
        isPrerelease: !!item.prerelease,
        htmlUrl: item.html_url,
      };

      // Search assets for installers
      if (Array.isArray(item.assets)) {
        item.assets.forEach((asset: any) => {
          const name = asset.name;
          const url = asset.browser_download_url;
          const size = formatBytes(asset.size || 0);

          if (name.endsWith('.exe')) {
            release.windowsAsset = { name, url, size };
          } else if (name.endsWith('.deb')) {
            release.linuxAssetDeb = { name, url, size };
          } else if (name.endsWith('.AppImage')) {
            release.linuxAssetAppImage = { name, url, size };
          }
        });
      }

      return release;
    });

    return { releases, isMocked: false };
  } catch (error: any) {
    console.error('Error fetching from GitHub releases API:', error);
    return { 
      releases: MOCK_RELEASES, 
      isMocked: true, 
      error: error.message || 'GitHub API unavailable.' 
    };
  }
}
