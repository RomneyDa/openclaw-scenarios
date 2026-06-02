output "linux_instance_ids" {
  value = { for key, instance in aws_instance.linux : key => instance.id }
}

output "windows_instance_ids" {
  value = { for key, instance in aws_instance.windows : key => instance.id }
}

output "mac_instance_ids" {
  value = { for key, instance in aws_instance.mac : key => instance.id }
}

output "ssm_targets" {
  value = concat(
    [for key, instance in aws_instance.linux : { id = key, instance_id = instance.id, os = "linux" }],
    [for key, instance in aws_instance.windows : { id = key, instance_id = instance.id, os = "windows" }],
    [for key, instance in aws_instance.mac : { id = key, instance_id = instance.id, os = "macos" }]
  )
}
