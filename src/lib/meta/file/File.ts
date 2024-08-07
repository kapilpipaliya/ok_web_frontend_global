import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

export const parentDirectory: FieldAttribute = {
  // TODO: Display Tree Information in options.
  collection: "g:'Folder'",
  componentName: "SelectBox",
  displayName: "Parent Folder",
  name: "ParentFolder",
  type: "ParentFolder",
  validation: { required: true },
};

export const File: IFormMetaData = {
  attributes: [
    // The name of the file as it was uploaded, including the file extension (e.g., document.pdf).
    { componentName: "TextBox", displayName: "File Name", name: "name" },
    // The size of the file in bytes, kilobytes, megabytes, etc.
    {
      componentName: "NumberBox",
      disabled: true,
      displayName: "File Size (bytes)",
      name: "fileSize",
    },
    // The MIME type of the file (e.g., image/jpeg, application/pdf). This helps in identifying the file format and handling it appropriately.
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "File Type",
      name: "fileType",
    },
    // The date and time when the file was uploaded. This can help track the age of files and manage storage space.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Upload Date",
      name: "uploadDate",
    },
    // Information about the user who uploaded the file, such as a user ID or username.
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "Uploader",
      name: "uploader",
    },
    // The location of the file in your storage system, which could be a file path (for on-premises storage) or a URL (for cloud storage).
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "File Path",
      name: "filePath",
    },
    // A brief description or notes about the file, which can provide context or additional details.
    {
      componentName: "TextArea",
      displayName: "Description",
      name: "description",
    },
    // A checksum or hash value (e.g., MD5, SHA-256) for verifying the file's integrity. This can ensure the file hasn't been altered or corrupted.
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "Checksum",
      name: "checksum",
    },
    // Tags or categories assigned to the file, which can help in organizing and searching files.
    {
      componentName: "TagBox",
      disabled: true,
      displayName: "Tags",
      name: "tags",
    },
    // If your system supports versioning, this would indicate the version of the file.
    {
      componentName: "NumberBox",
      disabled: true,
      displayName: "Version",
      name: "version",
    },
    // A URL to a thumbnail image for visual files (e.g., images, videos). This can be used for quick previews.
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "Thumbnail URL",
      name: "thumbnailUrl",
    },
    // If applicable, an expiration date for temporary files, after which they may be automatically deleted.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Expiration Date",
      name: "expirationDate",
    },
    parentDirectory,
  ],
  isInlineEditable: false,
  name: "File",
  title: "File",
};
export const Folder: IFormMetaData = {
  attributes: [
    // The name of the directory.
    { componentName: "TextBox", displayName: "Directory Name", name: "name" },
    // The date and time when the directory was created.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Creation Date",
      name: "creationDate",
    },
    // Information about the user who created the directory.
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "Creator",
      name: "creator",
    },
    // The location of the directory in your storage system.
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "Directory Path",
      name: "directoryPath",
    },
    // A brief description or notes about the directory.
    {
      componentName: "TextArea",
      displayName: "Description",
      name: "description",
    },
    // Tags or categories assigned to the directory.
    { componentName: "TagBox", displayName: "Tags", name: "fileTag" },
    // The number of files in the directory.
    {
      componentName: "NumberBox",
      disabled: true,
      displayName: "File Count",
      name: "fileCount",
    },
    parentDirectory,
  ],
  isInlineEditable: false,
  name: "Folder",
  title: "Folder",
};

export const FileTag: IFormMetaData = {
  attributes: [
    // The name of the tag.
    { componentName: "TextBox", displayName: "Tag Name", name: "name" },
    // A brief description or notes about the tag.
    {
      componentName: "TextArea",
      displayName: "Description",
      name: "description",
    },
    // The date and time when the tag was created.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Creation Date",
      name: "creationDate",
    },
    // Information about the user who created the tag.
    {
      componentName: "TextBox",
      disabled: true,
      displayName: "Creator",
      name: "creator",
    },
  ],
  isInlineEditable: false,
  name: "FileTag",
  title: "File Tag",
};
