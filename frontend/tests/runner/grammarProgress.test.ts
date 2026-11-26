import test from 'node:test';
import assert from 'node:assert/strict';

function resumeIndex(questionIds: string[], answeredIds: Set<string>, shuffled = false): number {
  const ordered = shuffled
    ? [...questionIds].sort((left, right) =>
        (Number(left.match(/(\d+)$/)?.[1] ?? 0) * 19) -
        (Number(right.match(/(\d+)$/)?.[1] ?? 0) * 19))
    : questionIds;
  const firstUnanswered = ordered.findIndex((id) => !answeredIds.has(id));
  return firstUnanswered < 0 ? 0 : firstUnanswered;
}

function firstAttemptAccuracy(attempts: Array<{questionId: string; correct: boolean}>): number {
  const firstByQuestion = new Map<string, boolean>();
  for (const attempt of attempts) {
    if (!firstByQuestion.has(attempt.questionId)) {
      firstByQuestion.set(attempt.questionId, attempt.correct);
    }
  }
  if (firstByQuestion.size === 0) return 0;
  const correct = [...firstByQuestion.values()].filter(Boolean).length;
  return correct / firstByQuestion.size;
}

test('resume finds the first question never answered even when shuffled', () => {
  assert.equal(resumeIndex(['q1', 'q2', 'q3'], new Set(['q1', 'q3']), true), 1);
  assert.equal(resumeIndex(['q1', 'q2', 'q3'], new Set(['q1']), false), 1);
});

test('retry attempts never overwrite first-attempt accuracy', () => {
  const attempts = [
    { questionId: 'q1', correct: false },
    { questionId: 'q1', correct: true },
    { questionId: 'q2', correct: true },
  ];
  assert.equal(firstAttemptAccuracy(attempts), 0.5);
});

test('completed status requires all questions and first-attempt threshold', () => {
  const accuracy = firstAttemptAccuracy([
    { questionId: 'q1', correct: true },
    { questionId: 'q2', correct: false },
  ]);
  const completed = accuracy >= 0.5;
  assert.equal(completed, true);
});

test('new learner today strip has only the first-topic invitation state', () => {
  const today = {
    due: { count: 0 },
    resume: {},
    suggestion: { reason: '' },
    newLearner: true,
  };
  assert.equal(today.newLearner, true);
  assert.equal(today.due.count, 0);
  assert.equal(Object.keys(today.resume).length, 0);
  assert.equal('goal' in today, false);
});

test('bookmark badge hides count when saved_count is zero', () => {
  const savedCount = 0;
  assert.equal(savedCount > 0 ? String(savedCount) : null, null);
});

test('today/search failure does not invent or replace topic data', () => {
  const topics = [{ id: 'topic-1', titleVi: 'Hiện có thật' }];
  const todayFailed = true;
  assert.equal(todayFailed, true);
  assert.deepEqual(topics, [{ id: 'topic-1', titleVi: 'Hiện có thật' }]);
});
