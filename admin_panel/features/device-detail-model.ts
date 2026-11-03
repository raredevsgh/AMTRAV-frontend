import type {Device,DeviceTelemetry,CustomerDetail,JourneyRecord,AlertRecord} from "@/lib/api/types";
import type {DemoDeviceAdminState} from "@/lib/operations-design-fixtures";
import type {DesignDeviceProfile} from "@/lib/admin-design-fixtures";
import type {DeviceSnapshot} from "@/lib/device-design-fixtures";
export type DeviceDetailData={device:Device;telemetry:DeviceTelemetry|null;customer:CustomerDetail|null;customerMissing:boolean;journeys:JourneyRecord[];alerts:AlertRecord[];admin:DemoDeviceAdminState;revealUntil:number|null};
export type DeviceDetailView=DeviceDetailData & {profile:DesignDeviceProfile|undefined;snapshot:DeviceSnapshot|undefined;customerVisible:boolean};
