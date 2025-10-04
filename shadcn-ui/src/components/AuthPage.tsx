import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <LoginForm />
        </TabsContent>

        <TabsContent value="signup">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
