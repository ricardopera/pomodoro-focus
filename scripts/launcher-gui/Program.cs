using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PomodoroFocusLauncher
{
    class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                // Get the directory where this launcher is located
                string launcherDir = Path.GetDirectoryName(Application.ExecutablePath);
                string electronExe = Path.Combine(launcherDir, "Pomodoro Focus.exe");
                
                if (File.Exists(electronExe))
                {
                    // Start the Electron app without showing console
                    ProcessStartInfo startInfo = new ProcessStartInfo
                    {
                        FileName = electronExe,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        WindowStyle = ProcessWindowStyle.Hidden
                    };
                    
                    Process.Start(startInfo);
                }
                else
                {
                    MessageBox.Show("Pomodoro Focus.exe não encontrado!", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao iniciar aplicativo: {ex.Message}", "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}