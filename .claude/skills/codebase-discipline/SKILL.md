---
name: codebase-discipline
description: Use when implementing features, fixing bugs, or refactoring, and before declaring any code change complete. Guides minimal, maintainable implementation and performs a final codebase-bloat review.
---

# Codebase Discipline

Build the smallest complete solution that satisfies the requirement while preserving correctness, security, readability, and maintainability. Minimize unnecessary complexity, not line count.

## During implementation

1. **Inspect before changing.** Read the relevant code and search for existing utilities, patterns, dependencies, and tests before adding alternatives. If existing code already meets the requirement, say so and change nothing.
2. **Reuse before writing.** Prefer existing functionality when it genuinely fits. Avoid duplicate implementations.
3. **Justify structural additions.** Every new file, dependency, abstraction, or configuration option needs a concrete reason, proportional to the decision.
4. **Prefer direct solutions.** Avoid speculative frameworks, wrappers, layers, extension points, and generalized utilities for hypothetical future requirements.
5. **Abstract deliberately.** Duplication is a signal to investigate, not an automatic reason to abstract. As a default, consider abstraction when the same meaningful logic appears three times and the use cases genuinely share behavior.
6. **Control scope.** Change only what the task needs. Restructure existing code only when the change cannot be made cleanly without it; otherwise mention the cleanup as a suggestion instead of doing it. Do not reformat entire files.
7. **Preserve safeguards.** Keep necessary validation, error handling, security controls, data integrity, and meaningful tests. Do not compress readable code merely to reduce lines.
8. **Follow the existing system.** Use its conventions and architecture unless a concrete problem justifies departing from them.

## Final bloat review

Before declaring the task complete:

1. Run `git diff` and inspect the full change set, including untracked files (`git status`, `git ls-files --others --exclude-standard`).
2. Check that each new file, dependency, abstraction, configuration option, and significant block of logic is necessary.
3. Search for existing functionality that makes new code redundant.
4. Remove unnecessary complexity introduced by the current task when safe.
5. Do not delete pre-existing code or suspected dead code during this review. Report it separately unless removal was requested.
6. Check for unrelated changes, redundant validation, unnecessary indirection, speculative flexibility, and duplicated tests.
7. After the final cleanup, run the checks the project documents (AGENTS.md, CONTRIBUTING.md, CI workflows) that are relevant to the change.
8. Report what was verified and any checks that could not be run. Never claim tests passed unless they were executed.

Keep the review focused. Do not produce a lengthy report for routine changes. If a structural addition is justified, keep it rather than forcing an artificial reduction.

## Completion standard

The solution must satisfy the requirement, fit the existing codebase, avoid unjustified complexity, preserve important safeguards, and pass all relevant checks that can be run. The goal is the least unnecessary complexity, not the least code.
