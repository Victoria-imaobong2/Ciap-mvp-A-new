interface GreetingProps {
  name: string;
}

export const Greeting = ({ name }: GreetingProps) => {
    return (
        <div className="flex items-center gap-2">
            <p className="text-slate-500 text-lg font-medium">
            Welcome Back </p>
            <h2 className="text-3xl font-bold text-slate-900" >
              {name}</h2>
              </div>
    );
}