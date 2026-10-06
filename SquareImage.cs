using System.Drawing;
using System.Drawing.Imaging;

class Program {
    static void Main() {
        string path = @"C:\Users\526007\Project\TOKAS\frontend\public\tokas.png";
        using (Image original = Image.FromFile(path)) {
            int size = Math.Max(original.Width, original.Height);
            using (Bitmap square = new Bitmap(size, size)) {
                using (Graphics g = Graphics.FromImage(square)) {
                    g.Clear(Color.Transparent);
                    int x = (size - original.Width) / 2;
                    int y = (size - original.Height) / 2;
                    g.DrawImage(original, x, y, original.Width, original.Height);
                }
                square.Save(@"C:\Users\526007\Project\TOKAS\frontend\public\tokas_square.png", ImageFormat.Png);
            }
        }
    }
}
