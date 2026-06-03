// Libraries
import toast from "react-hot-toast";
const duration = 4000;
const position = "top-center";

export function sucessToast(message: string) {
  toast.success(message, {
    duration,
    position,
  });
}

export function errorToast(message: string) {
  toast.error(message, {
    duration,
    position,
  });
}

export function customToast(message: string) {
  toast(message, {
    duration,
    position,
  });
}
