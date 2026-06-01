# 2026-06-01 — Initial Pre-flight Prompt Safety Workflow

## Summary

This update introduces the first version of the TokenFence pre-flight prompt safety workflow.

The goal of this update is to make TokenFence Studio more than a regular chat interface. Before a prompt is sent to an LLM, the system now performs local checks, detects sensitive information, applies policy-based processing, and shows a safer final prompt preview.

## Added

* Added local pre-flight prompt processing before sending messages to LLMs.
* Added prompt safety scanning for common sensitive information.
* Added sensitive data redaction with safe placeholders.
* Added policy profiles:

  * Strict privacy mode
  * Balanced mode
  * Fast mode
  * Developer mode
* Added safety report output.
* Added final prompt preview.
* Added basic routing suggestions based on risk level and prompt intent.
* Added policy support to the Guard API.
* Added policy support to the Chat API.
* Improved Guard Desk and Chat Desk integration with the pre-flight workflow.

## Improved Detection

The scanner now supports detection for several common sensitive data patterns, including:

* Emails
* API keys
* OpenAI-style keys
* Anthropic-style keys
* Google API keys
* AWS access keys
* Stripe keys
* Slack tokens
* Vercel tokens
* Database URLs
* Secret assignments

## Changed

* Updated the prompt sending flow so prompts are no longer treated as raw text by default.
* Added a safer intermediate processing step between user input and model invocation.
* Improved the project direction toward a pre-LLM safety, redaction, and routing layer.

## Security Notes

This update is still experimental, but it introduces the first local-first safety layer for TokenFence Studio.

When high-risk content is detected, the system can suggest safer handling, apply redaction, and show the final prompt before it is sent to a model.

## Files Updated

* `src/app/api/chat/route.ts`
* `src/app/api/guard/route.ts`
* `src/components/chat-desk.tsx`
* `src/components/guard-desk.tsx`
* `src/lib/core/guard.ts`
* `src/lib/core/scanner.ts`
* `src/lib/types.ts`

## Notes

This is an early-stage implementation and will continue to improve.

Future updates may include stronger context compression, better model routing, provider health checks, MCP integration, and more detailed agent workflow support.
