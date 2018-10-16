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
{{- else if eq .Values.NODE_ENV "dev" -}}
enterprise-api-dev.blockcluster.io
{{- end -}}
{{- end -}}

{{- define "server.monogUrl" -}}
{{- if eq .Values.NODE_ENV "production" -}}
mongodb://35.161.9.16:31972
{{- else if eq .Values.NODE_ENV "staging" -}}
mongodb://35.161.9.16:31972
{{- else if eq .Values.NODE_ENV "test" -}}
mongodb://35.161.9.16:32153
{{- else if eq .Values.NODE_ENV "dev" -}}
mongodb://35.161.9.16:32153
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
redis-master.{{ template "server.namespace" . }}.svc.cluster.local
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
