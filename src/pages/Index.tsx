import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  const firstName = user?.name
    ? user.name
        .replace(/\./g, " ")
        .trim()
        .split(/\s+/)[0]
        .replace(/^./, char => char.toUpperCase())
    : "User";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-semibold text-foreground">
        Hello {firstName}, Welcome to{" "}
        <span className="text-primary">Sense</span>
      </h1>
    </div>
  );
};

export default Index;