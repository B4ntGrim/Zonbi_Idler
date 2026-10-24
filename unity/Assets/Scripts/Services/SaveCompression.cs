// Assets/Scripts/Services/SaveCompression.cs
using System.IO;
using System.IO.Compression;
using System.Text;
using UnityEngine;

namespace ZedIdler.Services
{
    /// <summary>
    /// GZip wrapper for save JSON. Reduces save size 60-80% on typical payloads
    /// (lots of repeated keys in lists of contracts / listings).
    /// </summary>
    /// <remarks>
    /// File extension convention: `.zsave` for compressed, `.json` for raw.
    /// <see cref="LoadAuto"/> detects format by magic byte (gzip = 0x1F 0x8B).
    /// </remarks>
    public static class SaveCompression
    {
        public static byte[] Compress(string json)
        {
            using var ms = new MemoryStream();
            using (var gz = new GZipStream(ms, CompressionLevel.Optimal, leaveOpen: true))
            using (var sw = new StreamWriter(gz, Encoding.UTF8))
            {
                sw.Write(json);
            }
            return ms.ToArray();
        }

        public static string Decompress(byte[] data)
        {
            using var ms = new MemoryStream(data);
            using var gz = new GZipStream(ms, CompressionMode.Decompress);
            using var sr = new StreamReader(gz, Encoding.UTF8);
            return sr.ReadToEnd();
        }

        public static void WriteCompressed(string path, string json)
        {
            File.WriteAllBytes(path, Compress(json));
        }

        public static string LoadAuto(string path)
        {
            if (!File.Exists(path)) return null;
            var bytes = File.ReadAllBytes(path);
            if (bytes.Length >= 2 && bytes[0] == 0x1F && bytes[1] == 0x8B)
            {
                try { return Decompress(bytes); }
                catch (System.Exception e) { Debug.LogError($"[SaveCompression] Decompress failed: {e}"); return null; }
            }
            return Encoding.UTF8.GetString(bytes);
        }
    }
}
