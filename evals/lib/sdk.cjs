// @ts-check
/* Thin wrapper over the Agent SDK for one-shot, tool-less model calls (judge, simulated Developer). */

/** @returns {Promise<any>} */
function sdk() { return import('@anthropic-ai/claude-agent-sdk'); }

/**
 * @param {{ prompt: string, system: string, model: string, maxBudgetUsd: number, cwd?: string }} o
 * @returns {Promise<{ text: string, costUsd: number }>}
 */
async function oneShot(o) {
  const { query } = await sdk();
  const q = query({
    prompt: o.prompt,
    options: {
      cwd: o.cwd || process.cwd(), model: o.model, systemPrompt: o.system, maxTurns: 1, maxBudgetUsd: o.maxBudgetUsd,
      settingSources: [], permissionMode: 'default',
      canUseTool: async () => ({ behavior: 'deny', message: 'no tools in this call' }),
    },
  });
  let text = ''; let costUsd = 0;
  for await (const m of q) {
    if (m.type === 'assistant') for (const b of m.message.content) if (b.type === 'text') text += b.text;
    if (m.type === 'result') costUsd = m.total_cost_usd || 0;
  }
  return { text: text.trim(), costUsd };
}

module.exports = { sdk, oneShot };
