using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace KidsCalculatorApp
{
    static class Program
    {
        private static HttpListener _listener;
        private static Thread _serverThread;
        private static bool _running = true;
        private static string _webRoot;
        private static int _port;

        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                _webRoot = Path.Combine(baseDir, "www");

                if (!Directory.Exists(_webRoot))
                {
                    MessageBox.Show("Cannot find static assets directory 'www' in:\n" + baseDir,
                        "Kids Calculator - Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // Choose a random available port between 32000 and 42000
                _port = new Random().Next(32000, 42000);
                string prefix = string.Format("http://127.0.0.1:{0}/", _port);

                _listener = new HttpListener();
                _listener.Prefixes.Add(prefix);
                _listener.Start();

                _serverThread = new Thread(ServerWorker);
                _serverThread.IsBackground = true;
                _serverThread.Start();

                string edgePath = FindEdgePath();
                if (string.IsNullOrEmpty(edgePath))
                {
                    MessageBox.Show("Microsoft Edge browser was not found. Please ensure Edge is installed.",
                        "Kids Calculator - Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                string userDataDir = Path.Combine(Path.GetTempPath(), "KidsCalcUserData");

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = edgePath;
                psi.Arguments = string.Format("--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1080,780", prefix, userDataDir);
                psi.UseShellExecute = false;

                Process edgeProcess = Process.Start(psi);
                if (edgeProcess != null)
                {
                    edgeProcess.WaitForExit();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to launch Kids Calculator:\n" + ex.Message,
                    "Kids Calculator - Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                _running = false;
                try
                {
                    if (_listener != null && _listener.IsListening)
                    {
                        _listener.Stop();
                        _listener.Close();
                    }
                }
                catch { }
            }
        }

        private static string FindEdgePath()
        {
            string p1 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (File.Exists(p1)) return p1;

            string p2 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            if (File.Exists(p2)) return p2;

            string p3 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe");
            if (File.Exists(p3)) return p3;

            return null;
        }

        private static void ServerWorker()
        {
            while (_running)
            {
                try
                {
                    HttpListenerContext context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem((ctxObj) =>
                    {
                        HttpListenerContext ctx = (HttpListenerContext)ctxObj;
                        try
                        {
                            string relPath = ctx.Request.Url.AbsolutePath.TrimStart('/');
                            if (string.IsNullOrEmpty(relPath))
                            {
                                relPath = "index.html";
                            }

                            relPath = relPath.Replace('/', Path.DirectorySeparatorChar);
                            string localFilePath = Path.Combine(_webRoot, relPath);

                            if (Directory.Exists(localFilePath))
                            {
                                localFilePath = Path.Combine(localFilePath, "index.html");
                            }

                            if (!File.Exists(localFilePath) && !localFilePath.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
                            {
                                if (File.Exists(localFilePath + ".html"))
                                {
                                    localFilePath += ".html";
                                }
                            }

                            if (!File.Exists(localFilePath))
                            {
                                localFilePath = Path.Combine(_webRoot, "404.html");
                                if (!File.Exists(localFilePath))
                                {
                                    localFilePath = Path.Combine(_webRoot, "index.html");
                                }
                            }

                            if (File.Exists(localFilePath))
                            {
                                byte[] bytes = File.ReadAllBytes(localFilePath);
                                ctx.Response.ContentType = GetMimeType(localFilePath);
                                ctx.Response.ContentLength64 = bytes.Length;
                                ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
                            }
                            else
                            {
                                ctx.Response.StatusCode = 404;
                            }
                        }
                        catch
                        {
                            try { ctx.Response.StatusCode = 500; } catch { }
                        }
                        finally
                        {
                            try { ctx.Response.OutputStream.Close(); } catch { }
                        }
                    }, context);
                }
                catch
                {
                    if (!_running) break;
                }
            }
        }

        private static string GetMimeType(string path)
        {
            string ext = Path.GetExtension(path).ToLowerInvariant();
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".svg": return "image/svg+xml";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".gif": return "image/gif";
                case ".ico": return "image/x-icon";
                case ".json": return "application/json";
                case ".woff": return "font/woff";
                case ".woff2": return "font/woff2";
                case ".ttf": return "font/ttf";
                case ".txt": return "text/plain; charset=utf-8";
                default: return "application/octet-stream";
            }
        }
    }
}
