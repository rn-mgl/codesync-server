import app from "@src/app.ts";

const port = process.env.PORT || 8000;

app.listen(8000, () => {
  console.log(`Listening to port ${port}...`);
});
