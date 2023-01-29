import { JSX, createEffect } from "solid-js";
import { fetchUUID, getLocalUUID } from "../../../utils/serverFunctions";
interface UUIDProps {
  value: string;
  onChange: (value: string) => void;
  isLocal?: boolean;
}
export const UUIDInput = (props: UUIDProps) => {
  const setUUID = (value: string) => props.onChange && props.onChange(value);
  createEffect(() => {
    if (!props.value) {
      if (props.isLocal) {
        getLocalUUID().then((d) => setUUID(d));
      } else {
        fetchUUID().then((d) => setUUID(d.uuid)); // always new uuid
      }
    }
  });
  return <></>;
};
