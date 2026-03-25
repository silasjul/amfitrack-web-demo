"use client";

import { useRef, useState, useEffect } from "react";
import AmfitrackWeb from "@/amfitrackWebSDK/AmfitrackWeb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function WebSdkPage() {
  const amfitrackWebRef = useRef(new AmfitrackWeb());
  const [status, setStatus] = useState("Disconnected");
  const [devices, setDevices] = useState<HIDDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<HIDDevice | null>(null);
  const [isReading, setIsReading] = useState(false);

  const requestConnection = async () => {
    const device = await amfitrackWebRef.current.requestConnection();
    if (device) {
      setSelectedDevice(device);
    }
    setStatus("Connected");
  };

  const autoConnectAuthorizedDevices = async () => {
    const devices = await amfitrackWebRef.current.autoConnectAuthorizedDevices();
    if (devices) {
      setDevices(devices);
    }
    setStatus("Connected");
  };

  const startReading = async (device: HIDDevice | null) => {
    if (!device) return;
    console.log("Starting reading for device:", device);
    await amfitrackWebRef.current.startReading(device);
    setIsReading(true);
  };

  const stopReading = () => {
    amfitrackWebRef.current.stopReading();
    setIsReading(false);
  };

  useEffect(() => {
    autoConnectAuthorizedDevices();
  }, []);

  const isConnected = status === "Connected";

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Amfitrack Web SDK</CardTitle>
              <CardDescription>USB device connection manager</CardDescription>
            </div>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full" onClick={requestConnection}>
            Connect New Device
          </Button>

          {devices.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Authorized Devices</p>
                {devices.map((device) => {
                  const isSelected = selectedDevice?.productId === device.productId;
                  return (
                    <Button
                      key={device.productId}
                      variant={isSelected ? "secondary" : "outline"}
                      className="w-full justify-between"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <span>{device.productName ?? `Device ${device.productId}`}</span>
                      {isSelected && (
                        <Badge variant="secondary">Selected</Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </>
          )}

          <Separator />

          <Button
            className="w-full"
            variant="outline"
            disabled={!selectedDevice || isReading}
            onClick={() => startReading(selectedDevice)}
          >
            Start Reading
          </Button>

          <Button
            className="w-full"
            variant="destructive"
            disabled={!isReading}
            onClick={stopReading}
          >
            Stop Reading
          </Button>

          {!selectedDevice && (
            <p className="text-center text-xs text-muted-foreground">
              Select a device above to enable reading
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
