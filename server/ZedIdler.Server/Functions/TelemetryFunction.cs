// server/ZedIdler.Server/Functions/TelemetryFunction.cs
// Receives individual telemetry events from the Unity HttpAnalyticsSink and
// appends them to the telemetry store. Fire-and-forget on the client side, so
// this endpoint returns a minimal ack and never blocks.
using System.Net;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using ZedIdler.Server.Contracts;
using ZedIdler.Server.Storage;

namespace ZedIdler.Server.Functions
{
    public sealed class TelemetryFunction
    {
        private readonly ITelemetryStore _store;
        private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        public TelemetryFunction(ITelemetryStore store) { _store = store; }

        [Function("TelemetryEvent")]
        public async Task<HttpResponseData> TelemetryEvent(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "telemetry/event")] HttpRequestData req)
        {
            string body = await new System.IO.StreamReader(req.Body).ReadToEndAsync();
            try
            {
                var evt = JsonSerializer.Deserialize<TelemetryEvent>(body, Json);
                if (evt != null) await _store.AppendAsync(evt);
            }
            catch { /* swallow — telemetry must never error the client */ }

            var ok = req.CreateResponse(HttpStatusCode.OK);
            ok.Headers.Add("Content-Type", "application/json");
            await ok.WriteStringAsync(JsonSerializer.Serialize(new TelemetryAck { Received = true }, Json));
            return ok;
        }
    }
}
