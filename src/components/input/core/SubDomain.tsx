import { createEffect } from "solid-js";
import { getSubDomainRegex } from "../../../utils/url";
interface SubDomainProps {
  value: string;
  onChange: (value: string) => void;
  regex: string;
  exclude: string[];
}
export const SubDomain = (props: SubDomainProps) => {
  console.log(Object.keys(props));
  const setSubDomain = (value: string) => props.onChange && props.onChange(value);
  createEffect(() => {
    if (!props.value) {
      const subdomain = getSubDomainRegex(props.regex);
      if (subdomain && !props.exclude.includes(subdomain)) {
        setSubDomain(subdomain);
      }
    }
  });
  return <></>;
};
