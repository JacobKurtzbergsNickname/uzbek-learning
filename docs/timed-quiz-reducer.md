# Timed Quiz Reducer Logic

This document describes the flow and logic of the timed quiz reducer state machine, enabling developers to implement the same logic in any framework or language.

---

## State Structure

The quiz state machine tracks:

- `current`: Index of the current question
- `phase`: Current step in the quiz flow (`question`, `showingAnswer`, `finished`)
- `timer`: Seconds left for the current question
- `selected`: User's selected answer (or null)
- `answerOptions`: Array of answer options for the current question
- `results`: Array of result objects for each question

---

## Phases

1. **question**: User is presented with a question and answer options. Timer counts down.
2. **showingAnswer**: Correct answer is shown after user input or timeout. Brief pause before next question.
3. **finished**: Quiz is complete; results are available.

---

## Actions & Transitions

- `START_QUESTION`: Begin a new question. Reset timer, selection, and generate new options.
- `TICK`: Decrement timer by 1. If timer reaches 0 and no answer is selected, transition to `showingAnswer` (timeout).
- `SELECT_ANSWER`: User selects an answer. Mark answer options, record result, transition to `showingAnswer`.
- `SHOW_ANSWER`: Explicitly transition to `showingAnswer` (not used in main flow, but available).
- `NEXT_QUESTION`: Advance to next question or finish quiz if all questions answered.
- `FINISH`: Transition to `finished` phase.

---

## Flow Logic

1. **Start Question**
   - Set phase to `question`, timer to initial value (e.g., 5 seconds), clear selection.
   - Generate answer options for the current question.

2. **Timer Tick**
   - If phase is `question`, decrement timer.
   - If timer reaches 0 and no answer is selected, mark correct answer, record result, transition to `showingAnswer`.

3. **User Answer**
   - If phase is `question`, record selection.
   - Mark answer options as correct/incorrect/selected.
   - Record result.
   - Transition to `showingAnswer`.

4. **Show Answer**
   - In `showingAnswer` phase, display correct answer for a brief period (e.g., 800ms).
   - After pause, transition to next question or finish.

5. **Next Question**
   - If more questions remain, increment `current`, reset timer, clear selection, generate new options, set phase to `question`.
   - If no questions remain, set phase to `finished`.

6. **Finish**
   - In `finished` phase, quiz is complete. Results are available for display or processing.

---

## Side Effects

- Timer interval is started in `question` phase and stopped in other phases.
- Brief pause (timeout) is used in `showingAnswer` phase before advancing.
- All side effects are managed outside the reducer (e.g., in orchestrating effect or controller).

---

## Result Object

Each result contains:

- `word`: The question word object
- `selected`: The user's selected answer (or null for timeout)
- `correct`: Boolean indicating if the answer was correct

---

## Summary

This reducer logic enables a robust, predictable timed quiz flow:

- Explicit state transitions
- Minimal rerenders
- Easy to reason about and extend
- Framework-agnostic (can be implemented in React, Vue, Svelte, Angular, etc.)

For implementation, use a pure reducer for state transitions and an orchestrating controller/effect for timers and delays.
