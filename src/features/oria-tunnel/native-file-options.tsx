// OriaTunnel FileOptionsMenu, GPL-3.0-only. Translation adapter only.
import {
  ArrowDownAZ,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Check,
  Clock, CalendarDays, CalendarPlus,
  Eye,
  EyeOff,
  FolderPlus,
  FileType2,
  FilePlus2,
  FileUp,
  FolderUp,
  Ruler,
  Upload,
  Plus,
} from "lucide-react";
import type {Locale} from "@/i18n/config";
import {getFileDemoCopy} from "./file-demo-copy";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

interface Props {
  locale:Locale;
  remote: boolean;
  hidden: boolean;
  sort: string;
  descending: boolean;
  grouped: boolean;
  onGroupChange: (value: boolean) => void;
  canCreate: boolean;
  canUpload: boolean;
  onHiddenChange: (hidden: boolean) => void;
  onSortChange: (sort: string) => void;
  onDescendingChange: (descending: boolean) => void;
  onCreate: () => void;
  onCreateText: () => void;
  onUpload: (folder: boolean) => void;
}

export function FileSortOptions(
  props: Pick<
    Props,
    "locale" | "sort" | "descending" | "onSortChange" | "onDescendingChange"
  >,
) {
  const copy=getFileDemoCopy(props.locale);
  const t=(key:string)=>String(copy[key as keyof typeof copy]);
  return (
    <>
      <DropdownMenuGroup>
        {["name", "type", "size", "modified", "created"].map((sort) => (
          <DropdownMenuItem
            key={sort}
            role="menuitemradio"
            aria-checked={props.sort === sort}
            onClick={() => props.onSortChange(sort)}
          >
            {sort === "name" ? (
              <ArrowDownAZ />
            ) : sort === "type" ? (
              <FileType2 />
            ) : sort === "size" ? (
              <Ruler />
            ) : (
              sort === "created" ? <CalendarPlus/> : <Clock />
            )}
            {t(sort)}
            {props.sort === sort && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {[false, true].map((descending) => (
          <DropdownMenuItem
            key={String(descending)}
            role="menuitemradio"
            aria-checked={props.descending === descending}
            onClick={() => props.onDescendingChange(descending)}
          >
            {descending ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
            {t(descending ? "descending" : "ascending")}
            {props.descending === descending && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
    </>
  );
}

export function FileCreateOptions(
  props: Pick<Props, "locale" | "canCreate" | "onCreate" | "onCreateText">,
) {
  const copy=getFileDemoCopy(props.locale);
  const t=(key:string)=>String(copy[key as keyof typeof copy]);
  return (
    <>
      <DropdownMenuItem disabled={!props.canCreate} onClick={props.onCreate}>
        <FolderPlus />
        {t("mkdir")}
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={!props.canCreate}
        onClick={props.onCreateText}
      >
        <FilePlus2 />
        {t("createText")}
      </DropdownMenuItem>
    </>
  );
}

export function FileUploadOptions(
  props: Pick<Props, "locale" | "canUpload" | "onUpload">,
) {
  const copy=getFileDemoCopy(props.locale);
  const t=(key:string)=>String(copy[key as keyof typeof copy]);
  return (
    <>
      {[false, true].map((folder) => (
        <DropdownMenuItem
          key={String(folder)}
          disabled={!props.canUpload}
          onClick={() => props.onUpload(folder)}
        >
          {folder ? <FolderUp /> : <FileUp />}
          {t(folder ? "uploadFolder" : "uploadFiles")}
        </DropdownMenuItem>
      ))}
    </>
  );
}

// Popup contents are shared by the local and remote file panes.
export function FileOptionsMenu(props: Props) {
  const copy=getFileDemoCopy(props.locale);
  const t=(key:string)=>String(copy[key as keyof typeof copy]);
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>{t("viewOptions")}</DropdownMenuLabel>
        <DropdownMenuItem role="menuitemcheckbox" aria-checked={props.grouped} onClick={() => props.onGroupChange(!props.grouped)}>
          <CalendarDays/>{copy.groupTime}<Check className={props.grouped ? "ml-auto" : "invisible ml-auto"}/>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => props.onHiddenChange(!props.hidden)}>
          {props.hidden ? <EyeOff /> : <Eye />}
          {t(props.hidden ? "hideHidden" : "showHidden")}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowDownAZ />
            {t("sortBy")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="files-options-popup">
            <FileSortOptions {...props} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>{t("directoryOptions")}</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!props.canCreate}>
            <Plus />
            {t("create")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="files-options-popup">
            <FileCreateOptions {...props} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {props.remote && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!props.canUpload}>
              <Upload />
              {t("upload")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="files-options-popup">
              <FileUploadOptions {...props} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuGroup>
    </>
  );
}
