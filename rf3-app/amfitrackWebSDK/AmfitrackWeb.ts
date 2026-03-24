import { VENDOR_ID, PRODUCT_ID_SENSOR, PRODUCT_ID_SOURCE } from "./config";

class AmfitrackWeb {
  private sensorDevice: HIDDevice | null = null;
  private sourceDevice: HIDDevice | null = null;

  private inputReportHandler: ((event: HIDInputReportEvent) => void) | null =
    null;

  constructor() {}

  public async requestConnection(): Promise<HIDDevice | null> {
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [
          { vendorId: VENDOR_ID, productId: PRODUCT_ID_SENSOR },
          { vendorId: VENDOR_ID, productId: PRODUCT_ID_SOURCE },
        ],
      });

      if (devices.length === 0) {
        throw new Error("No device was selected.");
      }

      const device = devices[0];

      if (device.productId === PRODUCT_ID_SENSOR) {
        this.sensorDevice = device;
        console.log("Sensor assigned.");
      } else if (device.productId === PRODUCT_ID_SOURCE) {
        this.sourceDevice = device;
        console.log("Source assigned.");
      } else {
        throw new Error(
          `Unrecognized Amfitrack product ID: ${device.productId}`,
        );
      }

      console.log(device);
      return device;
    } catch (error: any) {
      if (error.name === "NotFoundError") {
        throw new Error("No device was selected.");
      }

      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  public async autoConnectAuthorizedDevices(): Promise<HIDDevice[] | null> {
    const devices = await navigator.hid.getDevices();

    const authorizedDevices = devices.filter(
      (d) =>
        d.vendorId === VENDOR_ID &&
        (d.productId === PRODUCT_ID_SENSOR ||
          d.productId === PRODUCT_ID_SOURCE),
    );

    if (authorizedDevices.length > 0) {
      for (const device of authorizedDevices) {
        if (device.productId === PRODUCT_ID_SENSOR) {
          this.sensorDevice = device;
          console.log("Auto-connected to known device:", device.productName);
        } else if (device.productId === PRODUCT_ID_SOURCE) {
          this.sourceDevice = device;
          console.log("Auto-connected to known device:", device.productName);
        }
      }

      return authorizedDevices;
    }

    return null;
  }

  public async disconnect() {
    this.stopReading();

    if (this.sensorDevice?.opened) {
      await this.sensorDevice.close();
    }
    if (this.sourceDevice?.opened) {
      await this.sourceDevice.close();
    }

    this.sensorDevice = null;
    this.sourceDevice = null;
  }

  public async startReading(device: HIDDevice) {
    if (!device) return;

    if (!device.opened) {
      await device.open();
    }

    console.log(`Starting reads for ${device.productName}...`);

    this.inputReportHandler = (event: HIDInputReportEvent) => {
      this.processData(event.reportId, event.data);
    };

    device.addEventListener("inputreport", this.inputReportHandler);
  }

  public stopReading() {
    if (this.inputReportHandler) {
      this.sensorDevice?.removeEventListener(
        "inputreport",
        this.inputReportHandler,
      );
      this.sourceDevice?.removeEventListener(
        "inputreport",
        this.inputReportHandler,
      );
      this.inputReportHandler = null;
    }
  }

  private processData(reportId: number, data: DataView) {
    console.log(`Report ID: ${reportId}`);
    console.log("Raw Bytes:", new Uint8Array(data.buffer));
  }
}

export default AmfitrackWeb;
