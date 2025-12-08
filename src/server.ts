import app from "@src/app.ts";

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
