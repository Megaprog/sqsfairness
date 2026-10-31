# SQS Fair Queues

A 25-second Remotion animation explaining how Amazon SQS fair queues help reduce the impact of a noisy tenant on other tenants sharing a standard queue. The 1280×720 schematic uses color-coded tenant messages, animated queue movement, and dwell-time indicators.

▶ **[Watch the animation](https://megaprog.github.io/sqsfairness/)**

## Scenes

| Time | Scene | On-screen narration |
| --- | --- | --- |
| 0–6s | **Steady state** — four tenant producers feed a shared queue and consumers receive a mixed stream. | Messages from four tenants share one standard queue. |
| 6–16s | **Noisy neighbor impact** — Tenant A fills the queue and occupies consumers; dwell time rises for all tenants. | Tenant A floods the queue. Workers are occupied with A’s messages. |
| 16–25s | **Mitigation with fair queues** — B, C, and D move through the queue faster while A’s backlog continues to drain; quiet-tenant dwell time recovers. | SQS prioritizes B, C and D; their dwell stays low while A’s backlog drains. |

The narration appears as on-screen text. The animation does not include a spoken voice track.

## Browser player

Install dependencies and run the browser player locally:

```sh
npm install
npm run dev:player
```

The player runs the composition in the browser with no MP4. Use `npm run dev` to open Remotion Studio and edit the animation.

## Publish on GitHub Pages

The `Deploy player to GitHub Pages` workflow builds a static player page from the React composition and deploys it when changes are pushed to `main`. To enable the first deployment, open **Settings → Pages** and set the source to **GitHub Actions**. The published player does not require Node.js on viewers' devices.

For a local production build, run:

```sh
npm run build:player
```

The build output is written to `dist/`, which is Git-ignored.

## Render an MP4

```sh
npx remotion render src/index.ts NoisyNeighborPrototype out/sqs-fair-queues.mp4
```

The MP4 is generated locally in `out/sqs-fair-queues.mp4`. The `out/` directory is ignored by Git, so the rendered video is not included in this repository.

## Reference

The explanation is based on [Amazon SQS fair queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-fair-queues.html). On standard queues, fair queues help prioritize messages from quiet tenants when another tenant is noisy, reducing quiet tenants’ dwell time while the noisy tenant’s backlog drains.
