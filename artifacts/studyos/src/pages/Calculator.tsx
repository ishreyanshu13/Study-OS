import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  
  // Very simplified stub calculator
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Calculator</h1>
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="bg-muted p-4 rounded-md mb-4 text-right text-3xl font-mono">
            {display}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"].map(btn => (
              <Button key={btn} variant="secondary" className="h-12 text-lg font-medium">
                {btn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
