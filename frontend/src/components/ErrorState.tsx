export default function ErrorState({ message }: { message?: string |null}) {
  return <div>שגיאה: {message?? "משהו השתבש"}</div>;
}