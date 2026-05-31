import { NextResponse } from 'next/server';

// Pre-compiled fallback redirect to serve if GitHub API fails, is rate-limited, or has no releases yet.
const MOCK_LINUX_ASSET_URL = 'https://github.com/Abdul-Razack/billing-optics/releases/download/v1.0.0/Billing_Optics_ERP-1.0.0.AppImage';

export async function GET() {
  const repoOwner = 'Abdul-Razack';
  const repoName = 'billing-optics';

  try {
    // Fetch from GitHub latest release API with 5 minutes cache revalidation (300 seconds)
    const githubRes = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
      {
        next: { revalidate: 300 },
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Billing-Optics-Download-Redirector-Linux',
        },
      }
    );

    if (!githubRes.ok) {
      if (githubRes.status === 403 || githubRes.status === 429 || githubRes.status === 404) {
        console.warn(`GitHub API returned ${githubRes.status}. Redirecting to high-fidelity mock Linux AppImage.`);
        return NextResponse.redirect(MOCK_LINUX_ASSET_URL, 302);
      }
      throw new Error(`GitHub API returned status ${githubRes.status}: ${githubRes.statusText}`);
    }

    const releaseData = await githubRes.json();

    // Scan release assets dynamically
    if (releaseData && Array.isArray(releaseData.assets)) {
      const matchedAsset = releaseData.assets.find(
        (asset: any) => asset.name.endsWith('.AppImage')
      );

      if (matchedAsset && matchedAsset.browser_download_url) {
        // Return 302 Redirect directly to the Linux AppImage asset
        return NextResponse.redirect(matchedAsset.browser_download_url, 302);
      }
    }

    // Handle case where release exists but no Linux AppImage is compiled yet
    console.warn(`No Linux AppImage found in release ${releaseData?.tag_name}. Redirecting to baseline fallback.`);
    return NextResponse.redirect(MOCK_LINUX_ASSET_URL, 302);

  } catch (err: any) {
    console.error('Error in Linux AppImage download redirect handler:', err);
    // Emergency redirect fallback to preserve service uptime
    return NextResponse.redirect(MOCK_LINUX_ASSET_URL, 302);
  }
}
