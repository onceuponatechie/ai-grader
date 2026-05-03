import type { GradedResponse } from '@/types';

/**
 * Graded responses for the SS2 Quiz Week 4 (currently being graded by AI).
 * Mix of cleanly-graded and flagged-for-review, with the review reasons
 * written in plain English a teacher can act on immediately.
 *
 * For a prototype we model a representative subset of sessions in full
 * detail rather than all 142 — enough to demonstrate the queue.
 */
export const gradedResponses: GradedResponse[] = [
  // ──────────────────────────────────────────────────────────────
  // ses_101 — Ada Nwosu (clean, strong script)
  // ──────────────────────────────────────────────────────────────
  {
    id: 'gr_101_a',
    session_id: 'ses_101',
    question_id: 'q_101',
    student_answer: '7',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct. The pH of pure water at 25°C is 7 (neutral).',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_101_b',
    session_id: 'ses_101',
    question_id: 'q_102',
    student_answer: 'NaOH',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct. NaOH is a strong base, fully dissociating in water.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_101_c',
    session_id: 'ses_101',
    question_id: 'q_103',
    student_answer:
      'Molar mass of H2SO4 = 2 + 32 + 64 = 98 g/mol. Moles = mass / molar mass = 4.9 / 98 = 0.05 mol.',
    student_image_url: null,
    ai_score: 3,
    ai_confidence: 'high',
    ai_feedback:
      'Full marks. Molar mass calculated correctly, formula applied, final answer 0.05 mol with units.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_101_d',
    session_id: 'ses_101',
    question_id: 'q_104',
    student_answer: 'Cl⁻',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_101_e',
    session_id: 'ses_101',
    question_id: 'q_105',
    student_answer:
      'Equal volumes of all gases at the same temperature and pressure contain the same number of molecules.',
    student_image_url: null,
    ai_score: 2,
    ai_confidence: 'high',
    ai_feedback: 'Stated accurately. Full marks.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_101_f',
    session_id: 'ses_101',
    question_id: 'q_106',
    student_answer: '2HCl + Ca(OH)2 → CaCl2 + 2H2O',
    student_image_url: '/mock-images/handwritten/ses_101_q106.jpg',
    ai_score: 3,
    ai_confidence: 'high',
    ai_feedback: 'Equation balanced correctly. Handwriting is clear and legible.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_101_g',
    session_id: 'ses_101',
    question_id: 'q_107',
    student_answer: 'blue',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct. Universal indicator turns blue at pH 11.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_101_h',
    session_id: 'ses_101',
    question_id: 'q_108',
    student_answer:
      'Molarity is the moles of solute per litre of solution. M = 0.5 mol / 0.25 L = 2 mol/dm³.',
    student_image_url: null,
    ai_score: 4,
    ai_confidence: 'high',
    ai_feedback:
      'Definition correct, calculation correct, units stated. Full marks.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },

  // ──────────────────────────────────────────────────────────────
  // ses_102 — Segun Adetola (two need a closer look)
  // ──────────────────────────────────────────────────────────────
  {
    id: 'gr_102_a',
    session_id: 'ses_102',
    question_id: 'q_101',
    student_answer: '7',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_102_b',
    session_id: 'ses_102',
    question_id: 'q_102',
    student_answer: 'NH3',
    student_image_url: null,
    ai_score: 0,
    ai_confidence: 'high',
    ai_feedback:
      'Incorrect. NH3 is a weak base. The correct answer is NaOH, which is a strong base.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_102_c',
    session_id: 'ses_102',
    question_id: 'q_103',
    student_answer: '4.9 / 98 = 0.05',
    student_image_url: null,
    ai_score: 2,
    ai_confidence: 'moderate',
    ai_feedback:
      'Final answer is correct (0.05 mol) but the student did not show how the molar mass of 98 g/mol was obtained, and units are missing.',
    manual_score: null,
    needs_review: true,
    review_reason:
      'The answer is right but the working is thin. Please confirm whether you want to award full marks (3) or deduct one mark for missing working.',
  },
  {
    id: 'gr_102_d',
    session_id: 'ses_102',
    question_id: 'q_104',
    student_answer: 'Cl-',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_102_e',
    session_id: 'ses_102',
    question_id: 'q_105',
    student_answer:
      'Equal volumes of gases at the same conditions contain the same number of particles.',
    student_image_url: null,
    ai_score: 2,
    ai_confidence: 'high',
    ai_feedback:
      'Acceptable wording — student used "particles" instead of "molecules" but the meaning is preserved at SS2 level.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_102_f',
    session_id: 'ses_102',
    question_id: 'q_106',
    student_answer: null,
    student_image_url: '/mock-images/handwritten/ses_102_q106.jpg',
    ai_score: 2,
    ai_confidence: 'low',
    ai_feedback:
      'The equation looks balanced, but the second coefficient on the right side is hard to read — could be a "2" or a "7".',
    manual_score: null,
    needs_review: true,
    review_reason:
      "AI couldn't read this handwriting clearly. Please open the image and confirm the coefficient before the H2O.",
  },
  {
    id: 'gr_102_g',
    session_id: 'ses_102',
    question_id: 'q_107',
    student_answer: 'blue',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_102_h',
    session_id: 'ses_102',
    question_id: 'q_108',
    student_answer:
      'Molarity = moles per dm³. 0.5 / 250 = 0.002 mol/dm³.',
    student_image_url: null,
    ai_score: 2,
    ai_confidence: 'high',
    ai_feedback:
      'Definition correct (1 mark). Calculation incorrect: student divided by 250 cm³ directly without converting to dm³. Correct answer is 2 mol/dm³, not 0.002.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },

  // ──────────────────────────────────────────────────────────────
  // ses_103 — Fatima Bello (auto-submitted, ran out of time)
  // ──────────────────────────────────────────────────────────────
  {
    id: 'gr_103_a',
    session_id: 'ses_103',
    question_id: 'q_101',
    student_answer: '7',
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'high',
    ai_feedback: 'Correct.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_103_b',
    session_id: 'ses_103',
    question_id: 'q_103',
    student_answer:
      'molar mass = 98. Moles = 4.9/98 = 0.05 mol',
    student_image_url: null,
    ai_score: 3,
    ai_confidence: 'high',
    ai_feedback: 'Correct working and answer. Full marks.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_103_c',
    session_id: 'ses_103',
    question_id: 'q_106',
    student_answer: null,
    student_image_url: null,
    ai_score: 0,
    ai_confidence: 'high',
    ai_feedback: 'No answer submitted. Time ran out before the student reached this question.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_103_d',
    session_id: 'ses_103',
    question_id: 'q_108',
    student_answer: null,
    student_image_url: null,
    ai_score: 0,
    ai_confidence: 'high',
    ai_feedback: 'No answer submitted. Time ran out.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },

  // ──────────────────────────────────────────────────────────────
  // ses_104 — Samuel Iroegbu (one partial-credit flag)
  // ──────────────────────────────────────────────────────────────
  {
    id: 'gr_104_a',
    session_id: 'ses_104',
    question_id: 'q_103',
    student_answer:
      'Molar mass = 1+1+32+16+16+16+16 = 98 g/mol. moles = 4.9 ÷ 98 = 0.05',
    student_image_url: null,
    ai_score: 3,
    ai_confidence: 'high',
    ai_feedback: 'Full marks. Working is laid out clearly.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_104_b',
    session_id: 'ses_104',
    question_id: 'q_105',
    student_answer:
      "Avogadro's law states that gases at same temperature contain same molecules.",
    student_image_url: null,
    ai_score: 1,
    ai_confidence: 'moderate',
    ai_feedback:
      'Partial. Student mentioned "same temperature" but missed "same pressure" and "equal volumes" — both are essential parts of the law.',
    manual_score: null,
    needs_review: true,
    review_reason:
      "Answer is partially correct. AI awarded 1 of 2 marks. Please confirm the score — some teachers accept partial wording at SS2.",
  },
  {
    id: 'gr_104_c',
    session_id: 'ses_104',
    question_id: 'q_108',
    student_answer:
      'Molarity = moles of solute per dm³ of solution. 250 cm³ = 0.25 dm³. M = 0.5 / 0.25 = 2 mol/dm³.',
    student_image_url: null,
    ai_score: 4,
    ai_confidence: 'high',
    ai_feedback:
      'Excellent. Definition, unit conversion, and calculation all correct. Full marks.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },

  // ──────────────────────────────────────────────────────────────
  // ses_105 — Titi Akande (handwriting flag)
  // ──────────────────────────────────────────────────────────────
  {
    id: 'gr_105_a',
    session_id: 'ses_105',
    question_id: 'q_106',
    student_answer: null,
    student_image_url: '/mock-images/handwritten/ses_105_q106.jpg',
    ai_score: 0,
    ai_confidence: 'low',
    ai_feedback:
      "The image shows what appears to be a balanced equation but several characters are smudged. AI could not read the answer reliably enough to mark it.",
    manual_score: null,
    needs_review: true,
    review_reason:
      "AI couldn't read this handwriting clearly. Please open the script and mark this one yourself.",
  },
  {
    id: 'gr_105_b',
    session_id: 'ses_105',
    question_id: 'q_107',
    student_answer: 'green',
    student_image_url: null,
    ai_score: 0,
    ai_confidence: 'high',
    ai_feedback: 'Incorrect. Green corresponds to a neutral pH (around 7), not pH 11. The correct answer is blue.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
  {
    id: 'gr_105_c',
    session_id: 'ses_105',
    question_id: 'q_108',
    student_answer:
      'Molarity is moles per litre. 0.5 mol in 250 ml = 0.5/0.25 = 2 M.',
    student_image_url: null,
    ai_score: 4,
    ai_confidence: 'high',
    ai_feedback: 'All correct. Full marks.',
    manual_score: null,
    needs_review: false,
    review_reason: null,
  },
];
