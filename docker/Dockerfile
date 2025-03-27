# Build Angular app
FROM node:22 AS angular-build
WORKDIR /src
COPY web-client/package*.json ./
RUN npm install
COPY web-client/ ./
RUN npm run build:prod

# Build .NET app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dotnet-build
WORKDIR /src
COPY server/Directory.*.props ./
COPY server/Api/Api.csproj Api/
RUN dotnet restore "Api/Api.csproj"
COPY server/ ./
COPY --from=angular-build /src/dist/travelsidecar/browser /src/Api/wwwroot
WORKDIR "/src/Api"
RUN dotnet build "Api.csproj" -c Release -o /app/build

FROM dotnet-build AS publish
RUN dotnet publish "Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
EXPOSE 8081
ENTRYPOINT ["dotnet", "Api.dll"]