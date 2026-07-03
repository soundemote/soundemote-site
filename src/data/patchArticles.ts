// Wiki-style article pages for individual patches/modules, at
// soundemote.io/<slug>. GitHub-README meets Wikipedia: an infobox of quick
// facts, a live (or placeholder) patch preview, and a long-form markdown body.
import type { GalleryItem } from "@/components/soundemote/MediaGallery";
export type { GalleryItem };

export type PatchArticleFact = {
  label: string;
  value: string;
};

export type PatchArticleBadge = {
  label: string;
  value: string;
  tone?: "scope" | "accent" | "muted";
};

export type PatchArticle = {
  slug: string;
  title: string;
  tagline: string;
  status: "live" | "placeholder";
  patchUrl?: string;
  category: string;
  badges: PatchArticleBadge[];
  facts: PatchArticleFact[];
  body: string;
  gallery?: GalleryItem[];
};

export const PATCH_ARTICLES: PatchArticle[] = [
  {
    slug: "analogbox",
    title: "Analogbox",
    tagline: "Analog feel, digital precision, phosphor glow — one instrument.",
    status: "live",
    patchUrl: "/patches/analogbox.json",
    category: "Manifesto",
    badges: [
      { label: "status", value: "live", tone: "scope" },
      { label: "category", value: "philosophy", tone: "accent" },
      { label: "formerly", value: "sandbox", tone: "muted" },
    ],
    facts: [
      { label: "Analog", value: "Circuit-accurate modeling (vactrols, ladder filters, chaos)" },
      { label: "Digital", value: "PolyBLEP, sub-sample sync, wavetables" },
      { label: "Phosphor", value: "CRT-decay trace rendering for the scope displays" },
      { label: "Formerly known as", value: "the sandbox" },
      { label: "Soundtrack", value: "“Retrofusion” — Hydrus & Elan Hickler" },
    ],
    gallery: [
      { type: "video", youtubeId: "PpcdN-DXYdc", title: "Analogbox in motion" },
    ],
    body: `## Why "Analogbox"

This used to just be called the sandbox — a fair name for a place to
experiment, but not a name that says anything about what it's actually
*for*. Every module and every trace on screen in here is chasing one goal:
take the physical, imprecise, gorgeous mess of real analog and optical
hardware and get it into a digital instrument without sanding off the parts
that made it beautiful in the first place. **Analogbox** is a better name
for that goal.

There are three ideas doing the work, and none of them are optional — pull
any one out and the other two stop making sense.

## Analog: model the circuit, not the curve

It's tempting to fake "analog" with a lookup curve or a coat of noise. This
toolkit doesn't do that. The [vactrolEnvelope](/shootingstar) module models
an actual vactrol — an LED and a photoresistor sealed in one light-tight
can, the same opto-isolator trick vintage synth designers reached for
because a photoresistor doesn't snap open and shut like a digital gate. It
glows up and fades down on its own asymmetric curve, and it never quite
reaches full darkness — there's a \`darkCurrent\` parameter for the tiny
leakage a real photoresistor never fully loses. The upcoming
[flowerChildFilter](/flowerchildfilter) does the same thing for resonant
filters: modeled closely enough off circuits like the Moog ladder that
self-oscillation and saturation *fall out of the model*, instead of being
faked as a separate "drive" stage bolted on after the fact.

Even the audio-rate chaos in [Shooting Star](/shootingstar) — a Lorenz
attractor humming away underneath the whole homepage — is this same
philosophy applied to a different kind of "analog": real physical systems
are continuous, sensitive to tiny perturbations, and never perfectly
repeat. A chaos attractor is the digital-native version of that same
unrepeatable, alive quality.

## Digital: precision where precision matters

None of that analog warmth is worth anything if the digital math underneath
it is sloppy. A naive digital oscillator aliases. A naive hard sync
oscillator aliases *worse*. So [PolyBLEP](/polyblep) exists — a tiny
polynomial correction applied exactly where a waveform's discontinuity
would otherwise fold ultrasonic energy back down into the audible range as
harsh digital noise — and [Surge Oscillator](/surgeoscillator) pushes the
same idea further, adding sub-sample-interpolated sync timing so a hard-sync
reset doesn't even snap to the nearest sample boundary, just the *true*
instant the crossing happened.

\`\`\`text
analog gives the instrument its character
digital gives the character somewhere clean to live
\`\`\`

Digital precision isn't the opposite of analog warmth here — it's the
foundation that lets the analog modeling actually be heard instead of
buried under aliasing artifacts.

## Phosphor: the glow underneath everything you see

The third leg is visual, and it's easy to miss because it's been running
under every module's scope display this whole time. Every trace in this
toolkit renders with decay behavior borrowed from real CRT oscilloscope
phosphor — the coating that glows when an electron beam hits it, then fades
on its own characteristic curve, brightest right where the beam just
passed, dimmer where it passed a moment ago, gone where it passed a while
ago. Classic scope phosphors like **P31** (fast green, general-purpose) or
longer-persistence formulations chosen for slow or one-shot signals all
have their own decay time constants, and that decay is exactly what gives
an analog scope trace its glowing, faintly smeared, unmistakably *alive*
look next to a flat, static, purely digital line plot.

The in-progress [Phosphillator](/phosphillator) module is this same idea
pushed from "a rendering style" into "a patchable behavior" — what does an
oscillator or envelope look like if its own output glows and decays the way
a phosphor screen does, instead of switching cleanly on and off?

## One instrument, not three features

Analog, digital, and phosphor aren't three separate feature checkboxes —
they're the same design instinct pointed at three different problems:
*model the real physical behavior closely enough that the interesting,
beautiful parts emerge on their own*, whether that behavior is a vactrol's
glow, a waveform's edge, or a screen's afterimage. That's what this
instrument is chasing, and it's a better name for it than "sandbox" ever
was.

Go play with it. It's the same app it always was — [open the full
editor](/sandbox), or start with [Shooting Star](/shootingstar) and work
outward from there.`,
  },
  {
    slug: "aliasingwars",
    title: "Aliasing Wars",
    tagline: "A grand, ongoing war against digital's ugliest sound.",
    status: "live",
    patchUrl: "/patches/surgeoscillator.json",
    category: "Manifesto / Fork Spotlight",
    badges: [
      { label: "status", value: "live front", tone: "scope" },
      { label: "enemy", value: "aliasing", tone: "muted" },
      { label: "origin", value: "aliasing-wars fork", tone: "accent" },
    ],
    facts: [
      { label: "Enemy", value: "Aliasing — folded, ultrasonic-turned-audible garbage" },
      { label: "Weapon I", value: "PolyBLEP (band-limits the edge itself)" },
      { label: "Weapon II", value: "Surge Oscillator (sub-sample sync timing)" },
      { label: "Weapon III", value: "DSF Oscillator (closed-form, can't alias)" },
      { label: "War room", value: "github.com/elanhickler/soemdsp-sandbox-aliasing-wars" },
    ],
    body: `## Declare it with us

There is a war. It has been fought since the first digital square wave hit
the first cheap DAC and came out sounding like a dial-up modem having a bad
day. The enemy is **aliasing**: the ugly, harsh, buzzing garbage that
appears whenever a naive digital waveform's hard edges fold ultrasonic
energy back down into frequencies you can actually hear. It is not a bug.
It is math working exactly as designed, and math does not care that it
sounds terrible.

We are not okay with this. **soemdsp-sandbox-aliasing-wars** — [the fork
where this fight actually happens on
GitHub](https://github.com/elanhickler/soemdsp-sandbox-aliasing-wars) — is
this toolkit's dedicated front line. Three weapons have shipped from it so
far. Here's the arsenal.

## Weapon I: PolyBLEP — the scalpel

You can't outrun a discontinuity, so [PolyBLEP](/polyblep) doesn't try. The
instant a square or saw wave's edge would slam from -1 to 1 (or back), a
small polynomial correction gets stitched in right at that exact sample —
band-limiting the discontinuity itself instead of the whole waveform. Cheap,
surgical, and it's the reason a plain digital square wave doesn't have to
sound like a dial tone anymore. This is the standard-issue sidearm of
basically every modern software synth, this one included.

## Weapon II: Surge Oscillator — the precision strike

Hard sync is where the war gets interesting. Force one oscillator's phase
back to zero every time a master oscillator crosses zero, and you get an
aggressive, screaming sweep — and *also* a fresh discontinuity every single
reset, often not even aligned to a sample boundary. [Surge
Oscillator](/surgeoscillator) fights on two fronts at once: it reuses the
same PolyBLEP correction at the sync-reset point, and it estimates the
*true, sub-sample instant* the zero-crossing happened instead of snapping
to the nearest sample — the same sub-sample-interpolated-sync trick real
analog-modeling synths use. Aggressive hard-sync sweeps, minus the alias
tax.

## Weapon III: DSF Oscillator — the nuclear option

Why fight discontinuities at all when you can generate a whole harmonic
series from math that never has one? [DSF (Discrete Summation
Formula)](/dsf) synthesis collapses an entire additive stack — fifty sine
oscillators, one per harmonic — into one closed-form algebraic expression.
No discontinuity ever enters the picture, so there's nothing to alias in
the first place. It's not deployed to the main build yet, but it's
war-tested in the fork and next in the queue.

\`\`\`text
the enemy:  a hard digital edge, sampled too honestly
the tactics: correct the edge (PolyBLEP), time the reset precisely
             (Surge Oscillator), or never create the edge at all (DSF)
\`\`\`

## Enlist

This isn't a closed front. If you've got a technique that band-limits
something this toolkit doesn't handle cleanly yet, [the aliasing-wars
repo](https://github.com/elanhickler/soemdsp-sandbox-aliasing-wars) is
where that fight gets picked up next. Go [hear the current arsenal in
action](/surgeoscillator), or read the [DSF](/dsf) and [PolyBLEP](/polyblep)
field notes. The war against ugly digital sound doesn't end — it just gets
better-armed.`,
  },
  {
    slug: "shootingstar",
    title: "Shooting Star",
    tagline: "🌠Trigger a chaos generator with a shooting star explosion.💥",
    status: "live",
    patchUrl: "/patches/shootingstar.json",
    category: "Chaos / Interactive",
    badges: [
      { label: "status", value: "live", tone: "scope" },
      { label: "modules", value: "3", tone: "muted" },
      { label: "category", value: "chaos", tone: "accent" },
    ],
    facts: [
      { label: "Modules", value: "shootingStarExplosion, vactrolEnvelope, lorenzAttractor" },
      { label: "Trigger", value: "Mouse / touch on the starfield" },
      { label: "Audio source", value: "Lorenz attractor (Y, Z → stereo)" },
      { label: "Default patch", value: "Homepage default" },
    ],
    gallery: [
      { type: "video", youtubeId: "Xn_GgdM_BWU", title: "Shooting Star patch video" },
    ],
    body: `## What's actually happening

This is the patch running on soundemote.io's homepage right now. Click a star in
the field above and you're not just triggering an animation — you're firing a
real signal into a live audio graph.

1. **\`shootingStarExplosion\`** is a "game trigger" module. It has no audio
   inputs at all — it just waits for an external event (your click) and, when
   one arrives, emits a single amplitude sample somewhere between its
   \`lowRange\` and \`highRange\` parameters (0–1). One sample. That's the whole
   trigger.
2. That pulse feeds the \`Light\` input of a **\`vactrolEnvelope\`** module — a
   physically-modeled stand-in for a real vactrol (an LED and a
   photoresistor sealed in the same little light-tight can, a trick opto-isolator
   designers have used since the 1970s to get a smooth, slightly asymmetric,
   analog-feeling envelope out of a digital trigger). Attack, release, curve,
   sensitivity, even a "dark current" parameter modeling the tiny leakage
   current a real photoresistor never fully loses in the dark — it's all here.
3. The vactrol's \`Env\` output modulates the **\`speed\`** parameter of a
   **\`lorenzAttractor\`** — the audio engine of the patch. Lorenz attractors are
   the textbook example of deterministic chaos: three coupled differential
   equations (classic \`sigma\`/\`rho\`/\`beta\` parameters, straight out of Edward
   Lorenz's 1963 paper on atmospheric convection) that never repeat, never
   settle, and are wildly sensitive to their starting conditions. The \`Y\` and
   \`Z\` state variables get sent straight to the stereo output as continuous
   audio.

> The result: a chaotic drone that never quite loops, occasionally kicked
> sideways by whatever vactrol-shaped envelope your last click produced.

## Why chaos instead of an oscillator?

A regular oscillator is periodic by definition — sample 44,100 sounds exactly
like sample 0 all over again. A chaos attractor has no period. It's still
fully deterministic (same starting state, same output, always), but two
starting states that differ by a rounding error diverge exponentially. That's
the "butterfly effect," and it's why this patch never sounds quite the same
twice even though nothing in it is random.

## Try it

Open the [full sandbox](/sandbox) and drag the Lorenz attractor's \`sigma\` or
\`rho\` sliders while it's running — small changes can flip the whole system
between a droning hum and an unstable shriek. That's chaos theory, not a bug.`,
  },
  {
    slug: "sinewave",
    title: "Sine Wave",
    tagline: "The simplest patch in the sandbox.",
    status: "live",
    patchUrl: "/patches/sinewave.json",
    category: "Oscillator",
    badges: [
      { label: "status", value: "live", tone: "scope" },
      { label: "modules", value: "1", tone: "muted" },
      { label: "category", value: "oscillator", tone: "accent" },
    ],
    facts: [
      { label: "Module", value: "sineWavetable" },
      { label: "Frequency", value: "220 Hz (A3)" },
      { label: "Outputs used", value: "sin → Left, cos → Right" },
      { label: "Synthesis method", value: "Wavetable, not Math.sin() per sample" },
    ],
    body: `## Hello, world

Every synthesis tradition needs a "hello world," and this is ours: one
oscillator, one frequency, one output. If you're new to modular patching,
start here.

The module doing the work is \`sineWavetable\`. It's tempting to assume a sine
oscillator just calls \`Math.sin()\` on every sample, and you *could* do that —
but it's slower than it needs to be, and it gets worse the more oscillators
you stack. Wavetable synthesis instead reads from a precomputed table of one
full cycle and interpolates between neighboring samples as the phase
accumulator sweeps through it. Same waveform, much cheaper per sample, and it
generalizes cleanly to non-sine waves later without changing the underlying
mechanism.

## The stereo trick

This particular patch does something slightly sneaky: it wires the module's
\`sin\` output to the Left channel and its \`cos\` output to the Right channel.
Sine and cosine are the same wave, 90° out of phase — so instead of a flat
mono tone doubled to both ears, you get a subtly wide stereo image for free,
with no extra modules, delays, or panning tricks. It's a cheap trick, but a
real one, and it's the same phase-quadrature idea that shows up later in
things like frequency shifters and single-sideband modulation.

## Parameters

\`\`\`text
phase   0.0 – 1.0   (cycle)   starting phase offset
freq    0 – 22050   (Hz)      220 by default — concert pitch A3
amp     0.0 – 1.0             output amplitude
\`\`\`

## Where to go from here

Once this makes sense, [polyblep](/polyblep) shows what happens when you swap
a smooth sine for a waveform with a hard discontinuity, and why that's a much
harder problem than it looks.`,
  },
  {
    slug: "polyblep",
    title: "PolyBLEP",
    tagline: "Anti-aliased square, the workhorse trick.",
    status: "live",
    patchUrl: "/patches/polyblep.json",
    category: "Oscillator",
    badges: [
      { label: "status", value: "live", tone: "scope" },
      { label: "modules", value: "1", tone: "muted" },
      { label: "category", value: "oscillator", tone: "accent" },
    ],
    facts: [
      { label: "Module", value: "polyBlep" },
      { label: "Waveform", value: "Square" },
      { label: "Frequency", value: "220 Hz" },
      { label: "Technique", value: "Polynomial Band-Limited Step" },
    ],
    body: `## The problem with square waves

A "perfect" digital square wave flips instantly between -1 and +1 — a true
discontinuity, a vertical line, infinite bandwidth in an instant. Real audio
hardware can't reproduce infinite bandwidth, and a naive digital
implementation doesn't even try: it just samples the sudden jump, which
folds all that impossible high-frequency content back down into the audible
range as harsh, inharmonic aliasing. It's the classic "buzzy," "harsh
digital" sound that gave early softsynths a bad reputation.

The textbook fix is *true* band-limited synthesis: build the square wave out
of only the harmonics that fit under Nyquist, additively, one sine per
harmonic. It sounds great and it's expensive — a bright square wave at a low
note can need dozens of oscillators just to render one waveform.

## The PolyBLEP trick

PolyBLEP (**Poly**nomial **B**and-**L**imited st**EP**) takes a different
approach entirely: keep the naive, cheap waveform generator, but detect the
exact moment a discontinuity happens and patch in a tiny polynomial
correction right around it — typically just one or two samples wide.

\`\`\`text
if phase is within one increment of a discontinuity:
    correction = polyBlep(phaseCycle, phaseIncrement)
    output -= correction   // rounds off the sharp edge
\`\`\`

The correction shape approximates what the *true* band-limited edge would
look like, smoothing exactly the part of the waveform that was aliasing,
and leaving everything else untouched. One tiny polynomial evaluation per
discontinuity, no extra oscillators, no lookup tables of harmonics — and the
aliasing drops enormously. It's not mathematically perfect the way full
additive synthesis is, but it's close enough that most ears (and most
professional software synths) can't tell the difference, at a fraction of
the CPU cost.

## Why this matters beyond one oscillator

This same correction — "smooth the discontinuity, leave the rest alone" — is
the foundation the [Surge Oscillator](/surgeoscillator) patch builds on for
something much harder: hard sync, where the discontinuity isn't just a
regular waveform edge but a forced phase reset from a second oscillator.`,
  },
  {
    slug: "surgeoscillator",
    title: "Surge Oscillator",
    tagline: "Hard sync without the alias war.",
    status: "live",
    patchUrl: "/patches/surgeoscillator.json",
    category: "Oscillator",
    badges: [
      { label: "status", value: "live", tone: "scope" },
      { label: "modules", value: "1", tone: "muted" },
      { label: "category", value: "oscillator / sync", tone: "accent" },
      { label: "origin", value: "aliasing-wars fork", tone: "muted" },
    ],
    facts: [
      { label: "Module", value: "surgeOscillator" },
      { label: "Frequency", value: "220 Hz" },
      { label: "Internal sync freq", value: "55 Hz (4:1 ratio)" },
      { label: "Ported from", value: "soemdsp-sandbox-aliasing-wars" },
    ],
    body: `## Hard sync, and why it's brutal on aliasing

Hard sync is an old analog trick: take two oscillators, and every time the
*master* oscillator's phase crosses zero, forcibly slam the *slave*
oscillator's phase back to zero too. The slave never completes a natural
cycle — it gets cut off mid-waveform, over and over, at the master's rate.
That's where the screaming, metallic hard-sync sweep sound comes from as you
detune the slave against the master.

It's also aliasing hell. A forced phase reset is a phase (and usually
amplitude) discontinuity injected in the *middle* of a waveform — not at a
predictable edge like a plain square wave — and a naive implementation
aliases badly at anything but the lowest frequencies.

## Reusing the PolyBLEP idea, in a new place

This module's trick, ported over from the \`aliasing-wars\` experimental
fork, is to notice that from the waveform generator's point of view, a
natural cycle wrap and a forced sync reset are *the same kind of event* —
both are "phase lands near zero." So it reuses the exact same
[PolyBLEP](/polyblep) correction this sandbox already uses for ordinary
wraps, applied at the sync-reset instant too. No second, sync-specific
correction path to write or get wrong.

## Sub-sample sync timing

There's a second, subtler source of aliasing at high sync ratios: if you
always reset phase to *exactly* zero, every reset lands on a sample
boundary, quantizing the sync timing to the sample rate and adding its own
jitter. This module instead linearly interpolates *where within the current
sample* the true zero-crossing happened, and resets phase to
\`frac × phaseIncrement\` — how far the new cycle would already have
progressed had the reset happened at its real, sub-sample instant. It's the
same idea Surge and other analog-modeling synths use for sync-aware
oscillators.

## Built-in sync source

Patching an external oscillator into the Sync input still works, but most
people just want "a second frequency knob" for a sync sweep — so this module
owns its own internal sine master oscillator (0–20,000 Hz), used
automatically whenever nothing's patched into Sync. This demo patch runs it
at 55 Hz against a 220 Hz slave — a 4:1 ratio, giving the classic aggressive
hard-sync buzz without any extra patching.`,
  },
  {
    slug: "dsf",
    title: "DSF Oscillator",
    tagline: "A closed-form trick for a whole harmonic series.",
    status: "placeholder",
    category: "Oscillator (not yet ported)",
    badges: [
      { label: "status", value: "placeholder", tone: "muted" },
      { label: "category", value: "oscillator", tone: "accent" },
      { label: "origin", value: "aliasing-wars fork", tone: "muted" },
    ],
    facts: [
      { label: "Module", value: "dsfOscillator (not in live build yet)" },
      { label: "Technique", value: "Discrete Summation Formula" },
      { label: "Origin", value: "James Moorer, 1976" },
      { label: "Lives in", value: "soemdsp-sandbox-aliasing-wars fork" },
    ],
    body: `> **This module isn't in the live sandbox yet.** It exists in the
> \`aliasing-wars\` experimental fork as \`dsfOscillator\` and is next on the
> list to port over. In the meantime, here's the actual technique — it's
> worth understanding on its own.

## Additive synthesis, without the additive cost

Additive synthesis builds a rich, harmonically complex tone by summing many
individual sine oscillators, one per harmonic. It sounds excellent and
scales terribly — a bright tone with fifty harmonics needs fifty oscillators
running every sample.

**Discrete Summation Formula (DSF)** synthesis, published by James A. Moorer
in his 1976 paper *"The synthesis of complex audio spectra by means of
discrete summation formulas,"* sidesteps the cost entirely. It's not an
approximation of additive synthesis — it's the exact same output, derived
from a closed-form algebraic identity for a geometric series of sine terms:

\`\`\`text
sum_{k=0}^{N} a^k · sin(θ + k·φ)  =  [a closed-form expression involving
                                       sin(θ), sin(θ+(N+1)φ), and cos(φ)]
\`\`\`

Instead of computing and summing N individual sine terms every sample, you
evaluate the closed-form right-hand side directly — a handful of
trigonometric calls total, regardless of how many harmonics \`N\` represents.
The \`a\` term (0 ≤ a < 1) controls how fast the harmonic amplitudes fall off:
close to 0 gives you almost a pure sine, close to 1 gives you a dense,
buzzy, near-sawtooth spectrum. One knob, an entire harmonic series.

## Why it still matters, decades later

DSF predates cheap floating-point hardware by a long way — in 1976, avoiding
fifty oscillator evaluations per sample wasn't an optimization, it was the
difference between real-time and not-real-time at all. But the trick hasn't
gone stale: it's still one of the cheapest ways to get a full, controllable
harmonic spectrum out of a handful of operations, and it shows up in
software synths to this day for exactly that reason.

## What to expect once it's ported

Based on the fork, expect a single oscillator module with a brightness/falloff
parameter (the \`a\` term above) driving everything from a near-sine to a
buzzy, saw-adjacent tone, with none of the aliasing risk of a literal
50-oscillator additive stack — closed-form math doesn't alias any worse than
the harmonics it represents already would.`,
  },
  {
    slug: "phosphillator",
    title: "Phosphillator",
    tagline: "An oscillator with a CRT's memory.",
    status: "placeholder",
    category: "Oscillator / Visual (concept)",
    badges: [
      { label: "status", value: "placeholder", tone: "muted" },
      { label: "category", value: "concept", tone: "accent" },
      { label: "origin", value: "phosphillator fork", tone: "muted" },
    ],
    facts: [
      { label: "Module", value: "phosphillator (not in live build yet)" },
      { label: "Inspiration", value: "CRT/oscilloscope phosphor decay" },
      { label: "Lives in", value: "soemdsp-sandbox-phosphillator fork" },
      { label: "Status", value: "Behavior still being finalized" },
    ],
    body: `> **This module isn't in the live sandbox yet**, and its exact behavior is
> still being worked out in the \`soemdsp-sandbox-phosphillator\` experimental
> fork. This page is a preview of the idea it's built around, not a
> finished feature.

## What a phosphor screen actually does

Long before LCDs, every oscilloscope and CRT display worked the same way: an
electron beam sweeps across a screen coated in **phosphor** — a material
that glows briefly after being struck by electrons, then fades. That fade
isn't instant. Classic scope phosphors like **P31** (a fast green,
used in general-purpose scopes) or the longer-persistence **P7** (a
blue-then-yellow-green afterglow, popular for slow or one-shot signals)
have decay times ranging from microseconds to whole seconds, and that decay
curve is exactly what gives a real analog scope trace its characteristic
glowing, slightly-smeared look — bright where the beam just passed, dimmer
where it passed a moment ago, gone where it passed a while ago.

This sandbox's own oscilloscope-style trace renderers already borrow that
aesthetic (the "burn" trace mode you can see under any module's scope
display leans on exactly this kind of decay), and the \`phosphillator\` fork's
project is to push that idea further — into a dedicated module rather than
just a visual style.

## The idea

"Phosphillator" is a portmanteau of *phosphor* and *oscillator* — the
working concept is a module where the phosphor-decay *behavior itself*
becomes something patchable, not just a fixed rendering style: think a
signal that "glows" and fades the way a real phosphor screen would if you
drove it directly, with the decay time, brightness, and afterglow color as
real parameters you can modulate like anything else in the graph.

## Why bother

Most of this sandbox's chaos and physically-modeled modules (the Lorenz
attractor, the vactrol envelope) exist because a physically accurate model
of an old piece of hardware behaves in ways a purely synthetic approximation
doesn't quite capture. Phosphor decay is no different — real CRT afterglow
has its own nonlinear, brightness-dependent falloff curve that's genuinely
interesting to have as a controllable audio or visual behavior, not just a
shader effect layered on top after the fact.

Check back — this one's actively being built.`,
  },
  {
    slug: "rhythmandpitchgenerator",
    title: "Rhythm & Pitch Generator",
    tagline: "One source, two dimensions of music.",
    status: "placeholder",
    category: "Sequencer (concept)",
    badges: [
      { label: "status", value: "wishlist", tone: "muted" },
      { label: "category", value: "concept", tone: "accent" },
    ],
    facts: [
      { label: "Module", value: "Doesn't exist yet, anywhere" },
      { label: "Status", value: "Design idea / wishlist" },
      { label: "Related modules", value: "clockDivider, pitchQuantizer, turingMachine" },
    ],
    body: `> **This is a design idea, not a real module.** It doesn't exist in this
> sandbox or in any experimental fork yet — it's on the wishlist, and this
> page exists to sketch out what it might become.

## The gap it would fill

Right now, if you want a patch that plays both a rhythm *and* a melody that
feel related to each other, you patch two separate systems and wire them
together by hand: a clock/trigger source (a \`clock\`, a \`clockDivider\`, maybe
a \`turingMachine\` for generative variation) driving envelopes and triggers,
and a *separate* pitch source (a \`pitchQuantizer\`, a sequencer, a chaos
source scaled into a scale) driving oscillator frequency. They can share a
clock, but the timing pattern and the pitch pattern are conceptually
unrelated — you're composing two independent streams that happen to be
synced, not one integrated musical idea.

## The concept

A combined **Rhythm & Pitch Generator** would derive both dimensions from
the *same* underlying generative logic, so a single source of variation —
whether that's a Euclidean rhythm algorithm, a chaos attractor, or a
mutating shift register like the \`turingMachine\` already in this sandbox —
produces a trigger pattern **and** a pitch sequence that are structurally
related, the way a real drummer's fills and a bassist's runs both come out
of the same rhythmic feel rather than two independently-scheduled
processes.

\`\`\`text
one generative core
   ├── onset/trigger stream   → drives envelopes, triggers, gates
   └── pitch stream           → drives oscillator frequency, quantized to scale
\`\`\`

## Why it's interesting

The most "alive"-feeling generative music usually has this property: the
rhythm and the melody aren't just synced, they're *entangled* — a busier
rhythmic moment often correlates with a more active melodic moment, because
they came from the same underlying process. Most modular systems (this one
included, for now) make you fake that relationship by hand-patching shared
modulation sources between otherwise-separate rhythm and pitch chains. A
purpose-built module that generates both from one core would make that
correlation the default instead of an advanced patching trick.

If you build this one before we do, [open a pull request](https://github.com/soundemote).`,
  },
  {
    slug: "flowerchildfilter",
    title: "Flower Child Filter",
    tagline: "The analog-modeled sibling of an existing module.",
    status: "placeholder",
    category: "Filter (not yet ported)",
    badges: [
      { label: "status", value: "placeholder", tone: "muted" },
      { label: "category", value: "filter", tone: "accent" },
      { label: "origin", value: "analog-filters fork", tone: "muted" },
    ],
    facts: [
      { label: "Module", value: "flowerChildFilter (not in live build yet)" },
      { label: "Lives in", value: "soemdsp-sandbox-analog-filters fork" },
      { label: "Already live", value: "flowerChildEnvelopeFollower" },
      { label: "Modeled after", value: "Moog ladder / ZDF-TPT style circuits" },
    ],
    body: `> **This exact module isn't in the live sandbox yet.** It exists in the
> \`analog-filters\` experimental fork as \`flowerChildFilter\` and hasn't been
> ported over. A *different* module in the same "Flower Child" family — the
> \`flowerChildEnvelopeFollower\` — is already live, and it's worth
> untangling the naming before the filter arrives.

## "Flower Child" is a family, not a single module

Every module family in this sandbox groups a few related modules under one
theme name. **Flower Child** is one of them, and right now it has one
member in the live build: the **\`flowerChildEnvelopeFollower\`** — a module
that tracks the amplitude envelope of an incoming audio signal, turning
"how loud is this signal right now" into a usable control voltage you can
patch into anything else. It's not a filter at all; it's an analysis
module.

The **\`flowerChildFilter\`**, still living in the \`analog-filters\` fork, is
the next member of the same family — an actual audio filter, not an
envelope follower — and once it's ported over, the two will sit side by
side as related-but-distinct tools under the same name.

## What kind of filter it is

The \`analog-filters\` fork's whole project is modeling classic analog filter
*circuits* — not approximating their frequency response with a generic
digital filter, but simulating the actual nonlinear circuit behavior of
things like the Moog ladder filter and zero-delay-feedback (ZDF/TPT)
topologies closely enough that the interesting parts — self-oscillating
resonance, saturating overdrive as you push the input or resonance hard —
**fall out of the model for free**, instead of being faked with a separate
"drive" stage bolted on afterward.

That's a meaningfully different design goal from a textbook biquad filter:
a real analog ladder filter doesn't just roll off frequencies cleanly, it
starts to sing and self-oscillate as resonance climbs, and it saturates
asymmetrically as you drive it — both are circuit-level side effects of
the actual hardware, and a good model reproduces them as emergent behavior
rather than post-hoc effects.

## What to expect

Once \`flowerChildFilter\` is ported, expect a resonant lowpass (family
resemblance to the Moog ladder) with drive/saturation and self-oscillation
built into the same signal path — not toggled on as separate features.`,
  },
  {
    slug: "robinschmidt",
    title: "Robin Schmidt / RS-MET",
    tagline: "Pitch dithering, RAPT math, and the road toward a Synthwave Orchestra.",
    status: "placeholder",
    category: "Algorithm tribute",
    badges: [
      { label: "status", value: "research spotlight", tone: "scope" },
      { label: "algorithm", value: "Pitch Dithering", tone: "accent" },
      { label: "library", value: "RS-MET / RAPT", tone: "muted" },
    ],
    facts: [
      { label: "Original repository", value: "github.com/RobinSchmidt/RS-MET" },
      { label: "Featured note", value: "Notes/Scratch/PitchDithering.md" },
      { label: "Featured code", value: "RobsJuceModules/rapt/Generators/PitchDitherOscs.h" },
      { label: "soemdsp mirror", value: "libs/RSMET" },
      { label: "Soundemote supersaw", value: "Supersaw.hpp" },
      { label: "Long-term dream", value: "Synthwave Orchestra" },
    ],
    gallery: [
      {
        type: "image",
        src: "/articles/robinschmidt/synthwave-orchestra-interface.png",
        alt: "Synthwave Orchestra interface concept",
      },
    ],
    body: `## Pitch Dithering comes first

[Robin Schmidt's Pitch Dithering note](https://github.com/RobinSchmidt/RS-MET/blob/work/Notes/Scratch/PitchDithering.md) is one of those rare algorithm sketches that feels like a door opening. The problem is brutally familiar: a naive digital sawtooth aliases, and the usual cures are mipmaps, BLEPs, oversampling, or some blend of all three. Pitch dithering asks a different question:

> what if the oscillator's cycle length is allowed to hop between nearby integer lengths, while the average pitch stays exactly right?

Instead of trying to represent a fractional-length cycle directly, the oscillator chooses integer cycle lengths around the desired fractional period. The probability-weighted average lands on the requested pitch, while the pitch error becomes controlled noise instead of a stable alias tone. The basic version alternates between the floor and ceiling cycle lengths. Robin's refined version uses three neighboring lengths and a distribution chosen so the mean error is zero and the variance stays controlled.

\`\`\`text
desiredCycle = sampleRate / frequency
mid          = nearest integer cycle length
short        = mid - 1
long         = mid + 1

choose short, mid, or long per cycle
so average cycle length stays on pitch
and the pitch error turns into shaped noise
\`\`\`

The important code artifact is [PitchDitherOscs.h](https://github.com/RobinSchmidt/RS-MET/blob/work/Libraries/RobsJuceModules/rapt/Generators/PitchDitherOscs.h), especially the \`rsPitchDitherOsc<T>\` class and its cycle-distribution routine. The implementation exposes phasor, saw, pulse, and sine sample methods, plus a seedable random path. The trick is small, but it is musically enormous: it trades a static digital artifact for something closer to analog imperfection.

## Why Soundemote cares

Soundemote is chasing a very specific beast: a **Synthwave Orchestra**. Not just a supersaw preset, not just a stack of detuned oscillators, but a playable section of electronic instruments where many voices breathe, drift, phase, and smear into one large emotional object.

Pitch dithering is perfect for that direction because a supersaw already wants controlled imperfection. In the pitch-dithering note, Robin even calls out supersaw as a natural place for the idea: the added noise can thicken the spectrum and act like random pitch movement while also fighting aliasing. That is exactly the kind of double-duty algorithm Soundemote needs.

## RS-MET inside soemdsp

The local soemdsp tree already carries a slice of RS-MET at:

\`\`\`text
C:\\Users\\argit\\Documents\\_PROGRAMMING\\soemdsp\\libs\\RSMET
\`\`\`

That folder is not decorative. It is a practical math and DSP shelf. In the older Soundemote supersaw work, \`Supersaw.hpp\` pulls in RAPT helpers such as \`RatioGenerator\` and the RSMET smoothing code. The supersaw master builds detune tables through ratio families like prime powers, prime-power differences, and linear-to-exponential spacing. That is Robin Schmidt style engineering: small mathematical tools that become musical structure.

The old supersaw code has named detune personalities like:

\`\`\`text
Classic
Realistic
Emotional
Chordal
Linear
Exponential
\`\`\`

Each one is a different answer to the same orchestral question: how should a cloud of oscillators spread around a pitch so it feels wide, alive, and intentional?

## The orchestra interface

The Synthwave Orchestra interface image on this page is the emotional target. It points toward an instrument where oscillator swarms, pitch drift, detune ratios, envelopes, and visual feedback are all part of one playable surface.

Pitch dithering belongs at the top of that stack because it solves a low-level oscillator problem while adding a high-level musical texture. That is the kind of algorithm Soundemote should build around: technically sharp, visually explainable, and emotionally useful.

## Credit

Robin Schmidt deserves direct credit here. RS-MET and RAPT are a deep body of DSP work, and Soundemote's use of these ideas should stay explicit. The original repository is [RobinSchmidt/RS-MET](https://github.com/RobinSchmidt/RS-MET). The pitch-dithering algorithm lives in the \`work\` branch notes and generator code linked above.

This page is both a thank-you and a marker: bring Pitch Dithering into Soundemote, use the code with clear attribution, and let it become part of the Synthwave Orchestra.`,
  },
];

export function findPatchArticle(slug: string): PatchArticle | undefined {
  return PATCH_ARTICLES.find((article) => article.slug === slug);
}
