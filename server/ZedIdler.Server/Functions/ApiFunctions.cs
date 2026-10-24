// server/ZedIdler.Server/Functions/ApiFunctions.cs
// Azure Functions (isolated .NET 8) HTTP handlers. Thin wrappers around
// PlayerService. For AWS Lambda, replace the [Function]/HttpRequestData
// plumbing with APIGatewayProxyRequest — the PlayerService calls are identical.
using System.Net;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Text.Json;
using ZedIdler.Server.Contracts;
using ZedIdler.Server.Services;

namespace ZedIdler.Server.Functions
{
    public sealed class ApiFunctions
    {
        private readonly PlayerService _svc;
        private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        public ApiFunctions(PlayerService svc) { _svc = svc; }

        [Function("AuthAnon")]
        public async Task<HttpResponseData> AuthAnon(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/anon")] HttpRequestData req)
            => await Handle(req, async body =>
                await _svc.SignInAnonymousAsync(Deserialize<AnonSignInRequest>(body)));

        [Function("SessionAcquire")]
        public async Task<HttpResponseData> SessionAcquire(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "session/acquire")] HttpRequestData req)
            => await Handle(req, async body =>
                await _svc.AcquireSessionAsync(Deserialize<SessionRequest>(body)));

        [Function("SessionHeartbeat")]
        public async Task<HttpResponseData> SessionHeartbeat(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "session/heartbeat")] HttpRequestData req)
            => await Handle(req, async body =>
                await _svc.HeartbeatAsync(Deserialize<SessionRequest>(body)));

        [Function("SessionRelease")]
        public async Task<HttpResponseData> SessionRelease(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "session/release")] HttpRequestData req)
            => await Handle(req, async body =>
                { await _svc.ReleaseSessionAsync(Deserialize<SessionRequest>(body)); return new { ok = true }; });

        [Function("SaveUpload")]
        public async Task<HttpResponseData> SaveUpload(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "save/upload")] HttpRequestData req)
            => await Handle(req, async body =>
                await _svc.UploadSaveAsync(Deserialize<SaveUploadRequest>(body)));

        [Function("SaveDownload")]
        public async Task<HttpResponseData> SaveDownload(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "save/download/{playerId}")] HttpRequestData req,
            string playerId)
            => await Handle(req, async _ => await _svc.DownloadSaveAsync(playerId));

        [Function("OfflineTick")]
        public async Task<HttpResponseData> OfflineTick(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "tick/offline")] HttpRequestData req)
            => await Handle(req, async body =>
                await _svc.OfflineTickAsync(Deserialize<OfflineTickRequest>(body)));

        [Function("CombatRun")]
        public async Task<HttpResponseData> CombatRun(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "combat/run")] HttpRequestData req)
            => await Handle(req, async body =>
                await _svc.ResolveCombatAsync(Deserialize<CombatRunRequest>(body)));

        [Function("Quota")]
        public async Task<HttpResponseData> Quota(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "quota/{playerId}")] HttpRequestData req,
            string playerId)
            => await Handle(req, async _ => await _svc.GetQuotaAsync(playerId));

        [Function("DailyClaim")]
        public async Task<HttpResponseData> DailyClaim(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "daily/claim")] HttpRequestData req)
            => await Handle(req, async body =>
                await _svc.ClaimDailyAsync(Deserialize<DailyClaimRequest>(body)));

        [Function("DailyStatus")]
        public async Task<HttpResponseData> DailyStatus(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "daily/status/{playerId}")] HttpRequestData req,
            string playerId)
            => await Handle(req, async _ => await _svc.GetDailyStatusAsync(playerId));

        // ─── Plumbing ───────────────────────────────────────────────────────
        private static async Task<HttpResponseData> Handle(HttpRequestData req, System.Func<string, Task<object>> work)
        {
            string body = await new System.IO.StreamReader(req.Body).ReadToEndAsync();
            object result;
            try { result = await work(body); }
            catch (System.Exception e)
            {
                var err = req.CreateResponse(HttpStatusCode.InternalServerError);
                await err.WriteStringAsync(JsonSerializer.Serialize(ApiError.Of(7, e.Message), Json));
                return err;
            }
            var ok = req.CreateResponse(HttpStatusCode.OK);
            ok.Headers.Add("Content-Type", "application/json");
            await ok.WriteStringAsync(JsonSerializer.Serialize(result, Json));
            return ok;
        }

        private static T Deserialize<T>(string body) => JsonSerializer.Deserialize<T>(body, Json);
    }
}
