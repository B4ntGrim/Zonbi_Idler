// Assets/Scripts/Services/Analytics/AnalyticsSinks.cs
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

namespace ZedIdler.Services.Analytics
{
    /// <summary>Dev sink — prints every event to the Unity console.</summary>
    public sealed class ConsoleAnalyticsSink : IAnalyticsSink
    {
        public bool Enabled = true;
        public void Record(AnalyticsEvent evt)
        {
            if (!Enabled) return;
            var sb = new StringBuilder();
            sb.Append($"[Analytics] {evt.category}/{evt.name}");
            if (evt.props != null && evt.props.Count > 0)
            {
                sb.Append(" { ");
                foreach (var kv in evt.props) sb.Append($"{kv.Key}={kv.Value} ");
                sb.Append('}');
            }
            Debug.Log(sb.ToString());
        }
    }

    /// <summary>
    /// Prod sink — POSTs each event individually to a serverless endpoint
    /// (POST /telemetry/event). Fire-and-forget; failures are swallowed so
    /// telemetry never blocks gameplay.
    /// </summary>
    public sealed class HttpAnalyticsSink : IAnalyticsSink
    {
        private readonly string _endpoint;
        private readonly MonoBehaviour _runner; // for coroutine/async context

        public HttpAnalyticsSink(string endpoint, MonoBehaviour runner)
        {
            _endpoint = endpoint;
            _runner = runner;
        }

        public void Record(AnalyticsEvent evt)
        {
            _ = SendAsync(evt);
        }

        private async Task SendAsync(AnalyticsEvent evt)
        {
            var dto = new Wire
            {
                category = evt.category.ToString(),
                name = evt.name,
                deviceId = evt.deviceId,
                sessionId = evt.sessionId,
                utcTicks = evt.utcTicks,
                propsJson = SerializeProps(evt.props)
            };
            string json = JsonUtility.ToJson(dto);
            using var req = new UnityWebRequest(_endpoint, "POST")
            {
                uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json)),
                downloadHandler = new DownloadHandlerBuffer(),
                timeout = 8
            };
            req.SetRequestHeader("Content-Type", "application/json");
            var op = req.SendWebRequest();
            while (!op.isDone) await Task.Yield();
            // Swallow result — telemetry must never affect gameplay.
        }

        private static string SerializeProps(Dictionary<string, object> props)
        {
            if (props == null || props.Count == 0) return "{}";
            var sb = new StringBuilder("{");
            bool first = true;
            foreach (var kv in props)
            {
                if (!first) sb.Append(',');
                sb.Append($"\"{kv.Key}\":\"{kv.Value}\"");
                first = false;
            }
            sb.Append('}');
            return sb.ToString();
        }

        [System.Serializable]
        private struct Wire
        {
            public string category, name, deviceId, sessionId, propsJson;
            public long utcTicks;
        }
    }
}
