{{- define "server.name" -}}
{{ "enterprise" }}
{{- end -}}

{{- define "server.image-tag" -}}
{{ .Values.NODE_ENV }}-{{ .Values.commitHash }}
{{- end -}}

{{- define "server.namespace" -}}
default
{{- end -}}

{{- define "server.app" -}}
enterprise-app
{{- end -}}

{{- define "server.host" -}}
{{- if eq .Values.NODE_ENV "production" -}}
enterprise-api.blockcluster.io
{{- else if eq .Values.NODE_ENV "staging" -}}
enterprise-api-staging.blockcluster.io
{{- else if eq .Values.NODE_ENV "test" -}}
enterprise-api-dev.blockcluster.io
{{- else if eq .Values.NODE_ENV "dev" -}}
enterprise-api-dev.blockcluster.io
{{- end -}}
{{- end -}}

{{- define "server.monogUrl" -}}
{{- if eq .Values.NODE_ENV "production" -}}
{{ .Values.MONGO_URL | quote }}
{{- else if eq .Values.NODE_ENV "staging" -}}
mongodb://68.183.254.111:31436
{{- else if eq .Values.NODE_ENV "test" -}}
mongodb://68.183.254.111:31469
{{- else if eq .Values.NODE_ENV "dev" -}}
mongodb://68.183.254.111:31469
{{- end -}}
{{- end -}}


{{- define "server.maxReplicas" }}
{{- if eq .Values.NODE_ENV "production" -}}
{{ .Values.server.production.maxReplicas }}
{{- else if eq .Values.NODE_ENV "test" -}}
{{ .Values.server.test.maxReplicas }}
{{- else if eq .Values.NODE_ENV "staging" -}}
{{ .Values.server.staging.maxReplicas }}
{{- else -}}
{{ .Values.server.dev.maxReplicas }}
{{- end -}}
{{- end -}}


{{- define "server.minReplicas" }}
{{- if eq  .Values.NODE_ENV "production" -}}
{{ .Values.server.production.minReplicas }}
{{- else if eq  .Values.NODE_ENV "test" -}}
{{ .Values.server.test.minReplicas }}
{{- else if eq  .Values.NODE_ENV "staging" -}}
{{ .Values.server.staging.minReplicas }}
{{- else -}}
{{ .Values.server.dev.minReplicas }}
{{- end -}}
{{- end -}}

{{- define "envs.redisHost" }}
{{- if eq .Values.NODE_ENV "production" -}}
web-production.vyqym8.ng.0001.aps1.cache.amazonaws.com
{{- else -}}
159.65.85.3
{{- end -}}
{{- end -}}

{{- define "envs.redisPort" -}}
"6379"
{{- end -}}

{{- define "server.nodeAffinities" }}
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: optimizedFor
          operator: In
          values:
          - compute
{{- end -}}
