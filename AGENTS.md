<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

<!-- App interaction decision: Keep press feedback and reduced-motion/transparency handling in shared design tokens and controls, so every InfoVault screen responds consistently without duplicating motion rules. -->
<!-- Mobile navigation decision: Use the existing Vaul drawer for More sections so dismissal tracks touch position and release velocity rather than a fixed sheet animation. -->
<!-- Selection motion decision: Keep the selection bar mounted but inert while hidden, allowing symmetric CSS entry/exit without delaying controls or adding a motion dependency. -->

<!-- Copy feedback decision: The copy tray replaces the "Copied" toast so the copied value can fly from its button into one fixed landing spot; sensitive values are never previewed. -->
<!-- Card morph decision: Use the browser View Transitions API (no library) to morph record cards into their edit dialog, skipped when unsupported or when reduced motion is requested. -->
