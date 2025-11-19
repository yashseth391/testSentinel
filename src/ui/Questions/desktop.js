const url =
  "https://iggyzkolpagccknuwbhr.supabase.co/storage/v1/object/sign/Questions/question1.json?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yMGU4NzRmNS1hZmVkLTRjN2YtODgzZC03ZmU3Y2E3ZDA4YmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJRdWVzdGlvbnMvcXVlc3Rpb24xLmpzb24iLCJpYXQiOjE3NjMyMzk3NzEsImV4cCI6MTc5NDc3NTc3MX0.DQWB0dcurubPrgPWpDKHJZr6QObKMjCO0YbALzqOR74";

 async function loadQuestion() {
  const question = await window.api.getQuestion(url);
  console.log("QUESTION:", question);
}

loadQuestion();
